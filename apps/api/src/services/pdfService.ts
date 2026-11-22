import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { env } from '../config/env';

export interface AgreementPdfData {
  agreementId: string;
  campaignTitle: string;
  sponsorName: string;
  sponsorContact: string;
  sponsorEmail: string;
  athleteName: string;
  athleteEmail: string;
  athleteSport: string;
  amount: number;
  currency: string;
  durationMonths: number;
  terms: string;
  status: string;
  createdAt: Date;
}

/**
 * Generate a formal PDF agreement document with SPORTSPOT branding
 */
export async function generateAgreementPdf(data: AgreementPdfData): Promise<string> {
  const agreementsDir = path.resolve(process.cwd(), env.UPLOAD_DIR, 'agreements');
  if (!fs.existsSync(agreementsDir)) {
    fs.mkdirSync(agreementsDir, { recursive: true });
  }

  const fileName = `agreement-${data.agreementId.slice(0, 8)}-${Date.now()}.pdf`;
  const filePath = path.join(agreementsDir, fileName);

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      margin: 50,
      info: {
        Title: `SPORTSPOT Sponsorship Agreement - ${data.campaignTitle}`,
        Author: 'SPORTSPOT Platform',
      },
    });

    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // Header styling
    doc
      .fillColor('#080D18')
      .rect(0, 0, doc.page.width, 100)
      .fill();

    doc
      .fillColor('#B6FF3B')
      .fontSize(22)
      .font('Helvetica-Bold')
      .text('SPORTSPOT', 50, 30);

    doc
      .fillColor('#FFFFFF')
      .fontSize(11)
      .font('Helvetica')
      .text('OFFICIAL SPONSORSHIP AGREEMENT MEMORANDUM', 50, 60);

    // Draft / Notice Watermark/Banner
    doc
      .fillColor('#EAB308')
      .fontSize(9)
      .font('Helvetica-Bold')
      .text(
        `STATUS: ${data.status.toUpperCase()} (DRAFT MEMORANDUM UNTIL DIGITALLY COUNTERSIGNED)`,
        50,
        115
      );

    // Horizontal Rule
    doc
      .strokeColor('#CBD5E1')
      .lineWidth(1)
      .moveTo(50, 135)
      .lineTo(doc.page.width - 50, 135)
      .stroke();

    // Parties Section
    doc.fillColor('#0F172A').fontSize(14).font('Helvetica-Bold').text('1. PARTIES INVOLVED', 50, 155);

    // Sponsor Box
    doc
      .fontSize(10)
      .font('Helvetica-Bold')
      .text('SPONSOR (PARTY A):', 50, 180)
      .font('Helvetica')
      .text(`Company: ${data.sponsorName}`, 50, 195)
      .text(`Representative: ${data.sponsorContact}`, 50, 210)
      .text(`Email: ${data.sponsorEmail}`, 50, 225);

    // Athlete Box
    doc
      .font('Helvetica-Bold')
      .text('ATHLETE (PARTY B):', 320, 180)
      .font('Helvetica')
      .text(`Athlete Name: ${data.athleteName}`, 320, 195)
      .text(`Sport Discipline: ${data.athleteSport}`, 320, 210)
      .text(`Email: ${data.athleteEmail}`, 320, 225);

    // Section 2: Financial & Term
    doc
      .strokeColor('#E2E8F0')
      .lineWidth(1)
      .moveTo(50, 255)
      .lineTo(doc.page.width - 50, 255)
      .stroke();

    doc.fontSize(14).font('Helvetica-Bold').text('2. SPONSORSHIP TERMS & ENDOWMENT', 50, 275);

    doc
      .fontSize(10)
      .font('Helvetica')
      .text(`Campaign: ${data.campaignTitle}`, 50, 300)
      .text(`Total Agreed Value: ${data.currency} ${data.amount.toLocaleString()}`, 50, 318)
      .text(`Agreement Duration: ${data.durationMonths} Month(s)`, 50, 336)
      .text(`Generated Date: ${data.createdAt.toLocaleDateString()}`, 50, 354);

    // Section 3: Terms & Deliverables
    doc
      .strokeColor('#E2E8F0')
      .lineWidth(1)
      .moveTo(50, 380)
      .lineTo(doc.page.width - 50, 380)
      .stroke();

    doc.fontSize(14).font('Helvetica-Bold').text('3. OBLIGATIONS & DELIVERABLES', 50, 400);

    doc
      .fontSize(9.5)
      .font('Helvetica')
      .text(data.terms, 50, 425, {
        width: doc.page.width - 100,
        align: 'justify',
        lineGap: 4,
      });

    // Signatures
    const sigY = 660;
    doc
      .strokeColor('#CBD5E1')
      .lineWidth(1)
      .moveTo(50, sigY)
      .lineTo(240, sigY)
      .stroke();

    doc
      .strokeColor('#CBD5E1')
      .lineWidth(1)
      .moveTo(320, sigY)
      .lineTo(510, sigY)
      .stroke();

    doc
      .fontSize(9)
      .font('Helvetica-Bold')
      .text('Authorized Sponsor Signature', 50, sigY + 8)
      .text('Athlete / Guardian Signature', 320, sigY + 8);

    doc
      .fontSize(8)
      .font('Helvetica')
      .fillColor('#64748B')
      .text(`Document Reference: ${data.agreementId}`, 50, doc.page.height - 40)
      .text('Generated autonomously by SPORTSPOT Secure Platform', 320, doc.page.height - 40);

    doc.end();

    stream.on('finish', () => {
      resolve(`/uploads/agreements/${fileName}`);
    });

    stream.on('error', (err) => {
      reject(err);
    });
  });
}
