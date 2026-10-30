import { formatAverage, gradeOn20, mention } from './grades'
import { formatNumericDate } from './utils'

/* Palette utilisée dans les trois formats (alignée sur l'application). */
const BRAND = '#5B5BF5'
const INK = '#101728'
const MUTED = '#6B7280'
const BORDER = '#D7DCE9'
const HEAD_BG = '#EEF0FF'
const ZEBRA = '#F8F9FD'

const hexToRgb = (hex) => {
  const value = parseInt(hex.replace('#', ''), 16)
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255]
}

const mixWithWhite = (hex, ratio) => {
  const [r, g, b] = hexToRgb(hex)
  const mix = (channel) => Math.round(channel + (255 - channel) * ratio)
  return `#${[mix(r), mix(g), mix(b)]
    .map((channel) => channel.toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase()}`
}

const sanitize = (value = '') =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '') || 'Eleve'

const exportFileName = (model, extension) =>
  `StudyFlow_Notes_${sanitize(model.student)}_${model.isoDate}.${extension}`

const downloadBlob = (blob, fileName) => {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1500)
}

/** Nettoie les caractères typographiques non supportés par les polices PDF standard. */
const pdfText = (value = '') =>
  String(value)
    .replace(/[’‘]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, '-')
    .replace(/…/g, '...')
    .replace(/\u00a0/g, ' ')

const appreciation = (average) => (average == null ? '—' : mention(average))

/**
 * Prépare les données communes aux exports Excel / Word / PDF.
 * Le détail est groupé par matière et des lignes vides sont ajoutées.
 */
export function buildGradeExportModel({ settings, stats, generalAverage }) {
  const now = new Date()
  return {
    student: settings.studentName || 'Élève',
    className: settings.className || '',
    isoDate: now.toISOString().slice(0, 10),
    dateLabel: new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(now),
    goal: settings.goal || 14,
    reveal: Boolean(settings.revealAverage),
    generalAverage: settings.revealAverage ? generalAverage : null,
    totalGrades: stats.reduce((sum, stat) => sum + stat.count, 0),
    subjects: stats.map((stat) => ({
      id: stat.subject.id,
      name: stat.subject.name,
      color: stat.subject.color || BRAND,
      coefficient: stat.subject.coefficient,
      average: stat.average,
      count: stat.count,
      grades: [...stat.grades]
        .sort((a, b) => (a.date < b.date ? 1 : -1))
        .map((grade) => ({
          id: grade.id,
          date: formatNumericDate(grade.date),
          title: grade.title,
          score: Number(grade.score),
          max: Number(grade.max) || 20,
          coefficient: Number(grade.coefficient) || 1,
          on20: gradeOn20(grade),
        })),
    })),
  }
}

/* ==========================================================================
   Excel (.xlsx) — 2 feuilles, entièrement modifiables
   ========================================================================== */

export async function exportGradesExcel(model) {
  const { default: writeExcelFile } = await import('write-excel-file/browser')

  const base = {
    fontSize: 10,
    alignVertical: 'center',
    borderColor: BORDER,
    borderStyle: 'thin',
  }
  const header = (value, extra = {}) => ({
    ...base,
    value,
    align: 'center',
    fontWeight: 'bold',
    backgroundColor: HEAD_BG,
    textColor: BRAND,
    wrap: true,
    height: 26,
    ...extra,
  })
  const blank = (span = 5, height = 8) => [
    { value: '', columnSpan: span, height, borderColor: undefined, borderStyle: undefined },
    ...Array(span - 1).fill(null),
  ]

  /* ---------------------------------------------------------- Synthèse */
  const synthesis = []
  synthesis.push([
    { ...base, value: 'StudyFlow', columnSpan: 5, fontWeight: 'bold', fontSize: 20, textColor: BRAND, height: 30 },
    null,
    null,
    null,
    null,
  ])
  synthesis.push([
    { ...base, value: 'Relevé de notes', columnSpan: 5, fontWeight: 'bold', fontSize: 14, textColor: INK, height: 22 },
    null,
    null,
    null,
    null,
  ])
  synthesis.push([
    {
      ...base,
      value: `Export du ${model.dateLabel}`,
      columnSpan: 5,
      fontSize: 9,
      textColor: MUTED,
      height: 16,
    },
    null,
    null,
    null,
    null,
  ])
  synthesis.push(blank(5))
  synthesis.push([
    {
      ...base,
      value: `${model.student}${model.className ? ` · ${model.className}` : ''}`,
      columnSpan: 5,
      fontWeight: 'bold',
      fontSize: 12,
      height: 22,
    },
    null,
    null,
    null,
    null,
  ])
  synthesis.push(blank(5))
  synthesis.push([
    { ...base, value: 'Synthèse par matière', columnSpan: 5, fontWeight: 'bold', fontSize: 12, textColor: BRAND, height: 24 },
    null,
    null,
    null,
    null,
  ])
  synthesis.push([
    header('Matière', { align: 'left' }),
    header('Coef.'),
    header('Notes'),
    header('Moyenne /20'),
    header('Appréciation'),
  ])

  model.subjects.forEach((subject, index) => {
    synthesis.push([
      { ...base, value: subject.name, fontWeight: 'bold', backgroundColor: index % 2 ? ZEBRA : undefined },
      { ...base, value: subject.coefficient, align: 'center', backgroundColor: index % 2 ? ZEBRA : undefined },
      { ...base, value: subject.count, align: 'center', backgroundColor: index % 2 ? ZEBRA : undefined },
      {
        ...base,
        value: subject.average == null ? '—' : subject.average,
        type: subject.average == null ? String : Number,
        format: subject.average == null ? undefined : '0.00',
        align: 'center',
        fontWeight: 'bold',
        textColor: subject.average != null && subject.average < 10 ? '#DC2626' : INK,
        backgroundColor: index % 2 ? ZEBRA : undefined,
      },
      {
        ...base,
        value: appreciation(subject.average),
        align: 'center',
        backgroundColor: index % 2 ? ZEBRA : undefined,
      },
    ])
  })

  if (model.reveal) {
    synthesis.push([
      {
        ...base,
        value: `Moyenne générale · objectif ${model.goal}/20`,
        columnSpan: 3,
        fontWeight: 'bold',
        backgroundColor: '#F0EFFF',
        height: 24,
      },
      null,
      null,
      {
        ...base,
        value: model.generalAverage == null ? '—' : model.generalAverage,
        type: model.generalAverage == null ? String : Number,
        format: model.generalAverage == null ? undefined : '0.00',
        align: 'center',
        fontWeight: 'bold',
        fontSize: 12,
        textColor: BRAND,
        backgroundColor: '#F0EFFF',
      },
      { ...base, value: appreciation(model.generalAverage), align: 'center', backgroundColor: '#F0EFFF' },
    ])
  } else {
    synthesis.push([
      {
        ...base,
        value: 'Moyenne générale non révélée — à découvrir dans StudyFlow.',
        columnSpan: 5,
        fontStyle: 'italic',
        fontSize: 9,
        textColor: MUTED,
        align: 'center',
        height: 22,
      },
      null,
      null,
      null,
      null,
    ])
  }

  synthesis.push(blank(5))
  synthesis.push([
    {
      ...base,
      value: 'Les moyennes par matière sont indicatives. La feuille « Détail des notes » est prête à être complétée.',
      columnSpan: 5,
      fontSize: 9,
      textColor: MUTED,
      wrap: true,
      height: 20,
    },
    null,
    null,
    null,
    null,
  ])

  /* ------------------------------------------------------------ Détail */
  const detail = []
  detail.push([
    { ...base, value: 'Détail des évaluations', columnSpan: 6, fontWeight: 'bold', fontSize: 16, textColor: BRAND, height: 28 },
    null,
    null,
    null,
    null,
    null,
  ])
  detail.push([
    {
      ...base,
      value: `${model.student}${model.className ? ` · ${model.className}` : ''} · ${model.dateLabel}`,
      columnSpan: 6,
      fontSize: 9,
      textColor: MUTED,
      height: 16,
    },
    null,
    null,
    null,
    null,
    null,
  ])
  detail.push(blank(6))
  detail.push([
    header('Date'),
    header('Évaluation', { align: 'left' }),
    header('Note'),
    header('Barème'),
    header('Coef.'),
    header('Sur 20'),
  ])

  model.subjects.forEach((subject) => {
    detail.push([
      {
        ...base,
        value: `${subject.name} · coef. ${subject.coefficient}${
          subject.average == null ? '' : ` · moyenne ${formatAverage(subject.average)}/20`
        }`,
        columnSpan: 6,
        fontWeight: 'bold',
        backgroundColor: mixWithWhite(subject.color, 0.86),
        textColor: INK,
        height: 22,
        topBorderColor: subject.color,
        topBorderStyle: 'medium',
      },
      null,
      null,
      null,
      null,
      null,
    ])

    subject.grades.forEach((grade, index) => {
      const background = index % 2 ? ZEBRA : undefined
      detail.push([
        { ...base, value: grade.date, align: 'center', backgroundColor: background },
        { ...base, value: grade.title, backgroundColor: background },
        { ...base, value: grade.score, type: Number, align: 'center', backgroundColor: background },
        { ...base, value: grade.max, type: Number, align: 'center', backgroundColor: background, textColor: MUTED },
        { ...base, value: grade.coefficient, type: Number, align: 'center', backgroundColor: background, textColor: MUTED },
        {
          ...base,
          value: grade.on20,
          type: Number,
          format: '0.00',
          align: 'center',
          fontWeight: 'bold',
          textColor: grade.on20 < 10 ? '#DC2626' : INK,
          backgroundColor: background,
        },
      ])
    })

    // Deux lignes vides pour ajouter des notes à la main après l'export.
    for (let index = 0; index < 2; index += 1) {
      detail.push([
        { ...base, value: '', height: 20 },
        { ...base, value: '' },
        { ...base, value: '' },
        { ...base, value: '' },
        { ...base, value: '' },
        { ...base, value: '' },
      ])
    }
  })

  if (!model.subjects.length) {
    detail.push([
      {
        ...base,
        value: 'Aucune matière enregistrée.',
        columnSpan: 6,
        align: 'center',
        textColor: MUTED,
        height: 24,
      },
      null,
      null,
      null,
      null,
      null,
    ])
  }

  detail.push(blank(6, 12))
  detail.push([
    {
      ...base,
      value: `Généré par StudyFlow le ${model.dateLabel}. Les lignes vides sont prévues pour ajouter des notes à la main.`,
      columnSpan: 6,
      fontStyle: 'italic',
      fontSize: 9,
      textColor: MUTED,
      height: 20,
    },
    null,
    null,
    null,
    null,
    null,
  ])

  const blob = await writeExcelFile(
    [
      {
        data: synthesis,
        sheet: 'Synthèse',
        showGridLines: false,
        columns: [{ width: 34 }, { width: 10 }, { width: 10 }, { width: 15 }, { width: 24 }],
      },
      {
        data: detail,
        sheet: 'Détail des notes',
        showGridLines: false,
        columns: [{ width: 14 }, { width: 44 }, { width: 10 }, { width: 10 }, { width: 9 }, { width: 12 }],
      },
    ],
    { fontFamily: 'Calibri', fontSize: 10 },
  ).toBlob()

  downloadBlob(blob, exportFileName(model, 'xlsx'))
}

/* ==========================================================================
   Word (.docx) — tableau mis en forme, modifiable
   ========================================================================== */

export async function exportGradesWord(model) {
  const {
    AlignmentType,
    BorderStyle,
    Document,
    HeightRule,
    Packer,
    Paragraph,
    ShadingType,
    Table,
    TableCell,
    TableRow,
    TextRun,
    VerticalAlign,
    WidthType,
  } = await import('docx')

  const border = { style: BorderStyle.SINGLE, size: 4, color: BORDER.replace('#', '') }
  const tableBorders = {
    top: border,
    bottom: border,
    left: border,
    right: border,
    insideHorizontal: border,
    insideVertical: border,
  }
  const fill = (hex) => ({ type: ShadingType.CLEAR, color: 'auto', fill: hex.replace('#', '') })

  const textCell = (text, options = {}) => {
    const {
      bold = false,
      color = INK.replace('#', ''),
      size = 19,
      align = AlignmentType.LEFT,
      shading,
      columnSpan,
      width,
      italics = false,
    } = options
    return new TableCell({
      columnSpan,
      width: width ? { size: width, type: WidthType.PERCENTAGE } : undefined,
      shading: shading ? fill(shading) : undefined,
      verticalAlign: VerticalAlign.CENTER,
      margins: { top: 70, bottom: 70, left: 110, right: 110 },
      children: [
        new Paragraph({
          alignment: align,
          children: [new TextRun({ text: String(text), bold, italics, size, color })],
        }),
      ],
    })
  }

  const blankCell = (width) =>
    new TableCell({
      width: width ? { size: width, type: WidthType.PERCENTAGE } : undefined,
      verticalAlign: VerticalAlign.CENTER,
      children: [new Paragraph({ children: [new TextRun({ text: '', size: 19 })] })],
    })

  const heading = (text) =>
    new Paragraph({
      spacing: { before: 260, after: 120 },
      children: [new TextRun({ text, bold: true, size: 24, color: INK.replace('#', '') })],
    })

  const sectionTitle = (text) =>
    new Paragraph({
      spacing: { after: 110 },
      children: [new TextRun({ text, bold: true, size: 22, color: BRAND.replace('#', '') })],
    })

  /* ---------------------------------------------------------- Synthèse */
  const synthesisRows = [
    new TableRow({
      tableHeader: true,
      children: [
        textCell('Matière', { bold: true, color: BRAND.replace('#', ''), shading: HEAD_BG, width: 34 }),
        textCell('Coef.', { bold: true, color: BRAND.replace('#', ''), shading: HEAD_BG, align: AlignmentType.CENTER, width: 11 }),
        textCell('Notes', { bold: true, color: BRAND.replace('#', ''), shading: HEAD_BG, align: AlignmentType.CENTER, width: 11 }),
        textCell('Moyenne /20', { bold: true, color: BRAND.replace('#', ''), shading: HEAD_BG, align: AlignmentType.CENTER, width: 18 }),
        textCell('Appréciation', { bold: true, color: BRAND.replace('#', ''), shading: HEAD_BG, align: AlignmentType.CENTER, width: 26 }),
      ],
    }),
    ...model.subjects.map(
      (subject, index) =>
        new TableRow({
          children: [
            textCell(subject.name, { bold: true, shading: index % 2 ? ZEBRA : undefined, width: 34 }),
            textCell(subject.coefficient, { align: AlignmentType.CENTER, shading: index % 2 ? ZEBRA : undefined, width: 11 }),
            textCell(subject.count, { align: AlignmentType.CENTER, shading: index % 2 ? ZEBRA : undefined, width: 11 }),
            textCell(subject.average == null ? '—' : formatAverage(subject.average), {
              bold: true,
              align: AlignmentType.CENTER,
              shading: index % 2 ? ZEBRA : undefined,
              width: 18,
              color: subject.average != null && subject.average < 10 ? 'DC2626' : INK.replace('#', ''),
            }),
            textCell(appreciation(subject.average), {
              align: AlignmentType.CENTER,
              shading: index % 2 ? ZEBRA : undefined,
              width: 26,
            }),
          ],
        }),
    ),
  ]

  if (model.reveal) {
    synthesisRows.push(
      new TableRow({
        children: [
          new TableCell({
            columnSpan: 3,
            shading: fill('#F0EFFF'),
            verticalAlign: VerticalAlign.CENTER,
            margins: { top: 80, bottom: 80, left: 110, right: 110 },
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: `Moyenne générale · objectif ${model.goal}/20`, bold: true, size: 20 }),
                ],
              }),
            ],
          }),
          textCell(model.generalAverage == null ? '—' : formatAverage(model.generalAverage), {
            bold: true,
            align: AlignmentType.CENTER,
            size: 22,
            color: BRAND.replace('#', ''),
            shading: '#F0EFFF',
          }),
          textCell(appreciation(model.generalAverage), {
            align: AlignmentType.CENTER,
            shading: '#F0EFFF',
          }),
        ],
      }),
    )
  } else {
    synthesisRows.push(
      new TableRow({
        children: [
          new TableCell({
            columnSpan: 5,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: 'Moyenne générale non révélée — à découvrir dans StudyFlow.',
                    italics: true,
                    size: 17,
                    color: MUTED.replace('#', ''),
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    )
  }

  const summaryTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: tableBorders,
    rows: synthesisRows,
  })

  /* ------------------------------------------------------------ Détail */
  const detailRows = [
    new TableRow({
      tableHeader: true,
      children: [
        textCell('Date', { bold: true, color: BRAND.replace('#', ''), shading: HEAD_BG, align: AlignmentType.CENTER, width: 16 }),
        textCell('Évaluation', { bold: true, color: BRAND.replace('#', ''), shading: HEAD_BG, width: 34 }),
        textCell('Note', { bold: true, color: BRAND.replace('#', ''), shading: HEAD_BG, align: AlignmentType.CENTER, width: 11 }),
        textCell('Barème', { bold: true, color: BRAND.replace('#', ''), shading: HEAD_BG, align: AlignmentType.CENTER, width: 11 }),
        textCell('Coef.', { bold: true, color: BRAND.replace('#', ''), shading: HEAD_BG, align: AlignmentType.CENTER, width: 9 }),
        textCell('Sur 20', { bold: true, color: BRAND.replace('#', ''), shading: HEAD_BG, align: AlignmentType.CENTER, width: 13 }),
      ],
    }),
  ]

  model.subjects.forEach((subject) => {
    detailRows.push(
      new TableRow({
        children: [
          new TableCell({
            columnSpan: 6,
            shading: fill(mixWithWhite(subject.color, 0.86)),
            verticalAlign: VerticalAlign.CENTER,
            margins: { top: 80, bottom: 80, left: 110, right: 110 },
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: `${subject.name} · coef. ${subject.coefficient}${
                      subject.average == null ? '' : ` · moyenne ${formatAverage(subject.average)}/20`
                    }`,
                    bold: true,
                    size: 19,
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    )

    subject.grades.forEach((grade, index) => {
      const shading = index % 2 ? ZEBRA : undefined
      detailRows.push(
        new TableRow({
          children: [
            textCell(grade.date, { align: AlignmentType.CENTER, shading, size: 18, width: 16 }),
            textCell(grade.title, { shading, width: 34 }),
            textCell(grade.score, { align: AlignmentType.CENTER, shading, width: 11 }),
            textCell(grade.max, { align: AlignmentType.CENTER, shading, color: MUTED.replace('#', ''), width: 11 }),
            textCell(`×${grade.coefficient}`, {
              align: AlignmentType.CENTER,
              shading,
              color: MUTED.replace('#', ''),
              width: 9,
            }),
            textCell(formatAverage(grade.on20), {
              bold: true,
              align: AlignmentType.CENTER,
              shading,
              width: 13,
              color: grade.on20 < 10 ? 'DC2626' : INK.replace('#', ''),
            }),
          ],
        }),
      )
    })

    for (let index = 0; index < 2; index += 1) {
      detailRows.push(
        new TableRow({
          height: { value: 360, rule: HeightRule.ATLEAST },
          children: [16, 34, 11, 11, 9, 13].map((width) => blankCell(width)),
        }),
      )
    }
  })

  if (!model.subjects.length) {
    detailRows.push(
      new TableRow({
        children: [
          new TableCell({
            columnSpan: 6,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: 'Aucune matière enregistrée.', color: MUTED.replace('#', '') })],
              }),
            ],
          }),
        ],
      }),
    )
  }

  const detailTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: tableBorders,
    rows: detailRows,
  })

  const document = new Document({
    creator: 'StudyFlow',
    title: `Relevé de notes — ${model.student}`,
    description: 'Export StudyFlow',
    styles: {
      default: {
        document: { run: { font: 'Calibri', size: 19, color: INK.replace('#', '') } },
      },
    },
    sections: [
      {
        properties: {
          page: {
            size: { width: 11906, height: 16838 },
            margin: { top: 720, right: 720, bottom: 720, left: 720 },
          },
        },
        children: [
          new Paragraph({
            spacing: { after: 40 },
            children: [new TextRun({ text: 'StudyFlow', bold: true, size: 36, color: BRAND.replace('#', '') })],
          }),
          new Paragraph({
            spacing: { after: 120 },
            children: [new TextRun({ text: 'Relevé de notes', bold: true, size: 30 })],
          }),
          new Paragraph({
            spacing: { after: 20 },
            children: [
              new TextRun({ text: `${model.student}${model.className ? ` · ${model.className}` : ''}`, bold: true }),
              new TextRun({ text: `   ·   Export du ${model.dateLabel}`, color: MUTED.replace('#', '') }),
            ],
          }),
          heading('Synthèse par matière'),
          summaryTable,
          sectionTitle('Détail des évaluations'),
          detailTable,
          new Paragraph({
            spacing: { before: 220 },
            children: [
              new TextRun({
                text: `Généré par StudyFlow le ${model.dateLabel}. Les lignes vides sont prévues pour ajouter des notes à la main.`,
                italics: true,
                size: 16,
                color: MUTED.replace('#', ''),
              }),
            ],
          }),
        ],
      },
    ],
  })

  const blob = await Packer.toBlob(document)
  downloadBlob(blob, exportFileName(model, 'docx'))
}

/* ==========================================================================
   PDF (.pdf) — prêt à imprimer
   ========================================================================== */

export async function exportGradesPdf(model) {
  const { jsPDF } = await import('jspdf')
  const { default: autoTable } = await import('jspdf-autotable')

  const doc = new jsPDF({ unit: 'pt', format: 'a4', compress: true })
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 40

  // Bandeau supérieur
  doc.setFillColor(...hexToRgb(BRAND))
  doc.rect(0, 0, pageWidth, 7, 'F')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(20)
  doc.setTextColor(...hexToRgb(BRAND))
  doc.text('StudyFlow', margin, 46)

  doc.setFontSize(17)
  doc.setTextColor(...hexToRgb(INK))
  doc.text('Relevé de notes', margin, 72)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(...hexToRgb(MUTED))
  doc.text(pdfText(`${model.student}${model.className ? ` · ${model.className}` : ''}`), margin, 90)
  doc.text(pdfText(`Export du ${model.dateLabel}`), pageWidth - margin, 90, { align: 'right' })

  const summaryBody = model.subjects.map((subject) => [
    pdfText(subject.name),
    String(subject.coefficient),
    String(subject.count),
    subject.average == null ? '—' : formatAverage(subject.average),
    appreciation(subject.average),
  ])

  if (model.reveal) {
    summaryBody.push([
      {
        content: `Moyenne générale · objectif ${model.goal}/20`,
        colSpan: 3,
        styles: { fontStyle: 'bold', fillColor: hexToRgb('#F0EFFF') },
      },
      {
        content: model.generalAverage == null ? '—' : formatAverage(model.generalAverage),
        styles: { halign: 'center', fontStyle: 'bold', textColor: hexToRgb(BRAND), fillColor: hexToRgb('#F0EFFF') },
      },
      {
        content: appreciation(model.generalAverage),
        styles: { halign: 'center', fillColor: hexToRgb('#F0EFFF') },
      },
    ])
  } else {
    summaryBody.push([
      {
        content: 'Moyenne générale non révélée — à découvrir dans StudyFlow.',
        colSpan: 5,
        styles: { halign: 'center', fontStyle: 'italic', textColor: hexToRgb(MUTED) },
      },
    ])
  }

  autoTable(doc, {
    startY: 108,
    head: [['Matière', 'Coef.', 'Notes', 'Moyenne /20', 'Appréciation']],
    body: summaryBody,
    theme: 'grid',
    margin: { left: margin, right: margin },
    styles: {
      font: 'helvetica',
      fontSize: 9,
      cellPadding: 6,
      lineColor: hexToRgb(BORDER),
      lineWidth: 0.5,
      textColor: hexToRgb(INK),
    },
    headStyles: {
      fillColor: hexToRgb(HEAD_BG),
      textColor: hexToRgb(BRAND),
      fontStyle: 'bold',
      halign: 'center',
    },
    alternateRowStyles: { fillColor: hexToRgb(ZEBRA) },
    columnStyles: {
      0: { cellWidth: 150, halign: 'left' },
      1: { cellWidth: 45, halign: 'center' },
      2: { cellWidth: 45, halign: 'center' },
      3: { cellWidth: 75, halign: 'center' },
      4: { cellWidth: 'auto', halign: 'center' },
    },
    didParseCell: (data) => {
      if (data.section !== 'body' || data.column.index !== 3) return
      const raw = data.cell.raw
      if (typeof raw === 'string' && raw.includes(',') && Number(raw.replace(',', '.')) < 10) {
        data.cell.styles.textColor = [220, 38, 38]
        data.cell.styles.fontStyle = 'bold'
      }
    },
  })

  let cursorY = doc.lastAutoTable.finalY + 26
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.setTextColor(...hexToRgb(INK))
  doc.text('Détail des évaluations', margin, cursorY)

  const detailBody = []
  model.subjects.forEach((subject) => {
    detailBody.push([
      {
        content: pdfText(
          `${subject.name} · coef. ${subject.coefficient}${
            subject.average == null ? '' : ` · moyenne ${formatAverage(subject.average)}/20`
          }`,
        ),
        colSpan: 6,
        styles: {
          fillColor: hexToRgb(mixWithWhite(subject.color, 0.86)),
          fontStyle: 'bold',
          textColor: hexToRgb(INK),
        },
      },
    ])

    subject.grades.forEach((grade) => {
      detailBody.push([
        pdfText(grade.date),
        pdfText(grade.title),
        String(grade.score),
        `/${grade.max}`,
        `×${grade.coefficient}`,
        formatAverage(grade.on20),
      ])
    })

    for (let index = 0; index < 2; index += 1) {
      detailBody.push([
        { content: '', styles: { minCellHeight: 20 } },
        '',
        '',
        '',
        '',
        '',
      ])
    }
  })

  if (!detailBody.length) {
    detailBody.push([
      {
        content: 'Aucune évaluation enregistrée.',
        colSpan: 6,
        styles: { halign: 'center', textColor: hexToRgb(MUTED) },
      },
    ])
  }

  autoTable(doc, {
    startY: cursorY + 10,
    head: [['Date', 'Évaluation', 'Note', 'Barème', 'Coef.', 'Sur 20']],
    body: detailBody,
    theme: 'grid',
    margin: { left: margin, right: margin, bottom: 60 },
    styles: {
      font: 'helvetica',
      fontSize: 9,
      cellPadding: 5,
      lineColor: hexToRgb(BORDER),
      lineWidth: 0.5,
      textColor: hexToRgb(INK),
      valign: 'middle',
    },
    headStyles: {
      fillColor: hexToRgb(HEAD_BG),
      textColor: hexToRgb(BRAND),
      fontStyle: 'bold',
      halign: 'center',
    },
    columnStyles: {
      0: { cellWidth: 70, halign: 'center' },
      1: { cellWidth: 'auto' },
      2: { cellWidth: 45, halign: 'center' },
      3: { cellWidth: 50, halign: 'center' },
      4: { cellWidth: 40, halign: 'center' },
      5: { cellWidth: 55, halign: 'center' },
    },
    didDrawPage: () => {
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8)
      doc.setTextColor(...hexToRgb(MUTED))
      doc.text(
        'Généré par StudyFlow — les lignes vides sont prévues pour ajouter des notes à la main.',
        margin,
        pageHeight - 24,
      )
      const page = doc.internal.getCurrentPageInfo().pageNumber
      doc.text(`Page ${page}`, pageWidth - margin, pageHeight - 24, { align: 'right' })
    },
  })

  doc.save(exportFileName(model, 'pdf'))
}
