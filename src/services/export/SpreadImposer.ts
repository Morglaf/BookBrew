import { PDFDocument, PDFPage, PDFEmbeddedPage } from 'pdf-lib';
import { promises as fs } from 'fs';

export class SpreadImposer {
    private baseCompensation: number = 0;

    constructor(
        private paperThickness: number = 0.1,
        private impositionTemplatePath?: string
    ) {
        if (impositionTemplatePath) {
            this.extractBaseCompensation(impositionTemplatePath);
        }
    }

    private async extractBaseCompensation(templatePath: string): Promise<void> {
        try {
            const content = await fs.readFile(templatePath, 'utf-8');
            const match = content.match(/\\newcommand{\\compensation}{([-\d.]+)mm}/);
            if (match && match[1]) {
                this.baseCompensation = parseFloat(match[1]);
            }
        } catch (error) {
            console.error('Error extracting base compensation:', error);
        }
    }

    private async loadPDF(pdfPath: string): Promise<PDFDocument> {
        const pdfBytes = await fs.readFile(pdfPath);
        return await PDFDocument.load(pdfBytes, { 
            ignoreEncryption: true,
            updateMetadata: false
        });
    }

    private async savePDF(doc: PDFDocument, outputPath: string): Promise<void> {
        const pdfBytes = await doc.save();
        await fs.writeFile(outputPath, pdfBytes);
    }

    private async addBlankPages(doc: PDFDocument, pagesPerSignature: number): Promise<void> {
        const currentPageCount = doc.getPageCount();
        const remainder = currentPageCount % pagesPerSignature;
        
        if (remainder > 0) {
            const blankPagesToAdd = pagesPerSignature - remainder;
            for (let i = 0; i < blankPagesToAdd; i++) {
                const blankPage = doc.addPage();
                const firstPage = doc.getPage(0);
                blankPage.setSize(firstPage.getWidth(), firstPage.getHeight());
            }
        }
    }

    private calculateSpreadCompensation(
        signatureIndex: number,
        totalSignatures: number
    ): number {
        const cahiersExterieurs = signatureIndex;
        const compensationPerSheet = 2 * this.paperThickness;
        const additionalCompensation = cahiersExterieurs * compensationPerSheet;
        const totalCompensation = this.baseCompensation + additionalCompensation;
        
        return totalCompensation;
    }

    private async embedPages(doc: PDFDocument, pages: PDFPage[]): Promise<PDFEmbeddedPage[]> {
        return await doc.embedPages(pages);
    }

    private async imposeSignature(
        inputDoc: PDFDocument,
        startPage: number,
        pagesPerSignature: number
    ): Promise<PDFDocument> {
        const outputDoc = await PDFDocument.create();
        const pages = inputDoc.getPages();
        const pageWidth = pages[0].getWidth();
        const pageHeight = pages[0].getHeight();

        const pagesToEmbed = pages.slice(startPage, startPage + pagesPerSignature);
        const embeddedPages = await this.embedPages(outputDoc, pagesToEmbed);

        const sheetsNeeded = pagesPerSignature / 4;
        
        for (let sheet = 0; sheet < sheetsNeeded; sheet++) {
            const rectoPage = outputDoc.addPage([pageWidth * 2, pageHeight]);
            
            const rectoIndices = [
                pagesPerSignature - 1 - sheet,
                sheet,
            ];

            for (let i = 0; i < 2; i++) {
                const pageIndex = rectoIndices[i];
                if (pageIndex < embeddedPages.length) {
                    await rectoPage.drawPage(embeddedPages[pageIndex], {
                        x: i * pageWidth,
                        y: 0,
                    });
                }
            }

            const versoPage = outputDoc.addPage([pageWidth * 2, pageHeight]);
            
            const versoIndices = [
                sheet + 1,
                pagesPerSignature - 2 - sheet,
            ];

            for (let i = 0; i < 2; i++) {
                const pageIndex = versoIndices[i];
                if (pageIndex < embeddedPages.length) {
                    await versoPage.drawPage(embeddedPages[pageIndex], {
                        x: i * pageWidth,
                        y: 0,
                    });
                }
            }
        }

        return outputDoc;
    }

    private async imposeSpread(
        inputDoc: PDFDocument,
        startPage: number,
        pagesPerSpread: number,
        signatureIndex: number,
        totalSignatures: number
    ): Promise<PDFDocument> {
        const outputDoc = await PDFDocument.create();
        const pages = inputDoc.getPages();
        const pageWidth = pages[0].getWidth();
        const pageHeight = pages[0].getHeight();

        const reorderedPages: PDFPage[] = [];
        const pagesForSpread = pages.slice(startPage, startPage + pagesPerSpread);
        
        const totalPages = pagesForSpread.length;
        const sheetsNeeded = totalPages / 2;

        for (let sheet = 0; sheet < sheetsNeeded; sheet++) {
            const rectoLeft = startPage + (sheet * 2);
            const rectoRight = startPage + totalPages - (sheet * 2) - 1;
            
            if (rectoLeft < pages.length) reorderedPages.push(pages[rectoLeft]);
            if (rectoRight < pages.length) reorderedPages.push(pages[rectoRight]);
        }

        const embeddedPages = await this.embedPages(outputDoc, reorderedPages);

        const compensation = this.calculateSpreadCompensation(signatureIndex, totalSignatures);

        for (let i = 0; i < sheetsNeeded; i++) {
            const outputPage = outputDoc.addPage([pageWidth * 2, pageHeight]);
            
            const leftIndex = i * 2;
            const rightIndex = i * 2 + 1;

            if (leftIndex < embeddedPages.length) {
                await outputPage.drawPage(embeddedPages[leftIndex], {
                    x: compensation,
                    y: 0,
                });
            }
            if (rightIndex < embeddedPages.length) {
                await outputPage.drawPage(embeddedPages[rightIndex], {
                    x: pageWidth + compensation,
                    y: 0,
                });
            }
        }

        return outputDoc;
    }

    async impose(
        inputPath: string,
        outputPath: string,
        pagesPerUnit: number,
        type: 'signature' | 'spread',
        impositionTemplatePath?: string
    ): Promise<void> {
        if (impositionTemplatePath) {
            await this.extractBaseCompensation(impositionTemplatePath);
        }

        const inputDoc = await this.loadPDF(inputPath);
        const initialPageCount = inputDoc.getPageCount();

        await this.addBlankPages(inputDoc, pagesPerUnit);
        const totalPages = inputDoc.getPageCount();
        const numberOfUnits = totalPages / pagesPerUnit;

        const imposedDocs: PDFDocument[] = [];

        for (let i = 0; i < numberOfUnits; i++) {
            const startPage = i * pagesPerUnit;
            const imposedDoc = type === 'signature'
                ? await this.imposeSignature(inputDoc, startPage, pagesPerUnit)
                : await this.imposeSpread(inputDoc, startPage, pagesPerUnit, i, numberOfUnits);
            
            imposedDocs.push(imposedDoc);
        }

        const finalDoc = await PDFDocument.create();
        for (const doc of imposedDocs) {
            const pages = doc.getPages();
            const embeddedPages = await this.embedPages(finalDoc, pages);
            for (const page of embeddedPages) {
                const newPage = finalDoc.addPage([page.width, page.height]);
                await newPage.drawPage(page);
            }
        }

        await this.savePDF(finalDoc, outputPath);
    }
} 