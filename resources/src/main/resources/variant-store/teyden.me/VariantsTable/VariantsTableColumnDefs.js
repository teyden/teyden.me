/*
 * This file is subject to the terms and conditions defined in file LICENSE,
 * which is part of this source code package.
 *
 * See the NOTICE file distributed with this work for additional
 * information regarding copyright ownership.
 */
import ObjectCountCellRenderer from './renderers/ObjectCountCellRenderer.jsx';
import ArrayCellRenderer from './renderers/ArrayCellRenderer.jsx';
import ArrayCountCellRenderer from './renderers/ArrayCountCellRenderer.jsx';
import LongTextCellRenderer from './renderers/LongTextCellRenderer.jsx';
import ClinVarCellRenderer from './renderers/ClinVarCellRenderer.jsx';
import DynamicFieldCellRenderer from './renderers/DynamicFieldCellRenderer.jsx';

const VariantsTableColumnDefs = [
  {
    headerName: 'RefGenome',
    headerTooltip: 'Reference Genome Assembly',
    width: 80,
    field: 'ref_genome',
    filter: 'text',
    unSortIcon: true,
  },
  {
    headerName: 'Chr',
    headerTooltip: 'Chromosome',
    width: 55,
    field: 'chrom',
    filter: 'text',
    unSortIcon: true,
  },
  {
    headerName: 'Pos',
    headerTooltip: 'Position',
    width: 100,
    field: 'pos',
    filter: 'number',
    unSortIcon: true,
  },
  {
    headerName: 'Ref',
    headerTooltip: 'Reference Allele',
    width: 125,
    field: 'ref',
    filter: 'text',
    unSortIcon: true,
  },
  {
    headerName: 'Alt',
    headerTooltip: 'Mutant Allele',
    width: 125,
    field: 'mut',
    filter: 'text',
    unSortIcon: true,
  },
  {
    headerName: 'Variant class',
    width: 110,
    field: 'variant_class',
    filter: 'text',
    unSortIcon: true,
  },
  {
    headerName: 'Variant function type',
    field: 'variant_function_type',
    suppressSorting: true,
    filter: 'text',
    cellRendererFramework: ArrayCellRenderer
  },
  {
    headerName: 'Coding variant type',
    width: 160,
    field: 'coding_variant_type',
    filter: 'text',
    unSortIcon: true,
  },
  {
    headerName: 'Gene symbol',
    width: 155,
    field: 'gene',
    suppressSorting: true,
    filter: 'text',
    cellRendererFramework: ArrayCellRenderer
  },
  {
    headerName: 'Detailed annotation',
    headerTooltip: 'Detailed annotation of the variant (RefSeq description variations)',
    width: 105,
    field: 'detailed_annotation',
    suppressSorting: true,
    filter: 'text',
    cellRendererFramework: ArrayCountCellRenderer
  },
  {
    headerName: 'dbSNP_142 \/ rsID #',
    width: 110,
    field: 'dbsnp_rsid',
    suppressSorting: true,
    filter: 'text',
    cellRendererFramework: ArrayCellRenderer
  },
  {
    headerName: 'dbSNP_142Common',
    headerTooltip: 'dbSNP_142Common',
    width: 40,
    field: 'dbsnp_common',
    suppressFilter: true,
    unSortIcon: true,
  },
  {
    headerName: '1000 Genomes AF',
    headerTooltip: '1000 Genomes allele frequency',
    width: 115,
    field: 'af_1kgenomes',
    filter: 'number',
    unSortIcon: true,
  },
  {
    headerName: 'ExAC AF',
    headerTooltip: 'ExAC allele frequency',
    width: 115,
    field: 'af_exac',
    filter: 'number',
    unSortIcon: true,
  },
    {
      headerName: 'Global AF',
      headerTooltip: 'Global allele frequency',
      width: 115,
      field: 'global_af',
      filter: 'number',
      unSortIcon: true,
    },
  {
    headerName: 'Complete Genomics AF',
    headerTooltip: 'Complete Genomics allele frequency',
    width: 115,
    field: 'af_complete_genomics',
    filter: 'number',
    unSortIcon: true,
  },
  {
    headerName: 'GoNL AF',
    headerTooltip: 'GoNL allele frequency',
    width: 115,
    field: 'af_gonl',
    filter: 'number',
    unSortIcon: true,
  },
  {
    headerName: 'Wellderly AF',
    headerTooltip: 'Wellderly allele frequency',
    width: 115,
    field: 'af_wellderly',
    filter: 'number',
    unSortIcon: true,
  },
  {
    headerName: 'Wellderly AC',
    headerTooltip: 'Wellderly allele count',
    width: 70,
    field: 'ac_wellderly',
    filter: 'number',
    unSortIcon: true,
  },
  {
    headerName: 'SIFT score',
    headerTooltip: 'SIFT score',
    width: 65,
    field: 'score_sift',
    filter: 'number',
    unSortIcon: true,
  },
  {
    headerName: 'SIFT pred',
    headerTooltip: 'SIFT prediction',
    width: 65,
    field: 'pred_sift',
    filter: 'text',
    unSortIcon: true,
  },
  {
    headerName: 'PolyPhen2 HumanDiv score',
    headerTooltip: 'PolyPhen2 HumanDiv score',
    width: 70,
    field: 'score_polyphen2_humdiv',
    filter: 'number',
    unSortIcon: true,
  },
  {
    headerName: 'PolyPhen2 HumanDiv prediction',
    headerTooltip: 'PolyPhen2 HumanDiv prediction',
    width: 65,
    field: 'pred_polyphen2_humdiv',
    filter: 'text',
    unSortIcon: true,
  },
  {
    headerName: 'PolyPhen2 HumanVar score',
    headerTooltip: 'PolyPhen2 HumanVar score',
    width: 70,
    field: 'score_polyphen2_humvar',
    filter: 'number',
    unSortIcon: true,
  },
  {
    headerName: 'PolyPhen2 HumanVar prediction',
    headerTooltip: 'PolyPhen2 HumanVar prediction',
    width: 65,
    field: 'pred_polyphen2_humvar',
    filter: 'text',
    unSortIcon: true,
  },
  {
    headerName: 'LRT score',
    headerTooltip: 'LRT score',
    width: 65,
    field: 'score_lrt',
    filter: 'number',
    unSortIcon: true,
  },
  {
    headerName: 'LRT pred',
    headerTooltip: 'LRT prediction',
    width: 65,
    field: 'pred_lrt',
    filter: 'text',
    unSortIcon: true,
  },
  {
    headerName: 'MutationTaster score',
    headerTooltip: 'MutationTaster score',
    width: 65,
    field: 'score_mtaster',
    filter: 'number',
    unSortIcon: true,
  },
  {
    headerName: 'MutationTaster prediction',
    headerTooltip: 'MutationTaster prediction',
    width: 65,
    field: 'pred_mtaster',
    filter: 'text',
    unSortIcon: true,
  },
  {
    headerName: 'Whole exome GERP++ score',
    headerTooltip: 'Whole exome GERP++ score',
    width: 70,
    field: 'score_gerp_we',
    filter: 'number',
    unSortIcon: true,
  },
  {
    headerName: 'Whole genome GERP++ score > 2',
    headerTooltip: 'Whole genome GERP++ score > 2',
    width: 70,
    field: 'score_gerp_wg',
    filter: 'number',
    unSortIcon: true,
  },
  {
    headerName: 'GERP++ conserved genomic regions',
    headerTooltip: 'GERP++ conserved genomic regions',
    width: 70,
    field: 'gerp_conserved_regions',
    filter: 'number',
    unSortIcon: true,
  },
  {
    headerName: 'CADD raw score',
    headerTooltip: 'CADD raw score',
    width: 70,
    field: 'score_cadd_raw',
    filter: 'number',
    unSortIcon: true,
  },
  {
    headerName: 'CADD PHRED score',
    headerTooltip: 'CADD PHRED score',
    width: 70,
    field: 'score_cadd_phred',
    filter: 'number',
    unSortIcon: true,
  },
  {
    headerName: 'PhyloP placental score (46)',
    headerTooltip: 'PhyloP score based on 46-way alignment placental subset',
    width: 70,
    field: 'score_phylop_plac',
    filter: 'number',
    unSortIcon: true,
  },
  {
    headerName: 'PhyloP vertebrate score (100)',
    headerTooltip: 'PhyloP score based on 100-way alignment vertebrate subset',
    width: 70,
    field: 'score_phylop_vert',
    filter: 'number',
    unSortIcon: true,
  },
  {
    headerName: 'Alt. AF for NHLBI-ESP w\/ 6500 exomes',
    headerTooltip: 'Alternative allele frequency for NHLBI-ESP w\/ 6500 exomes',
    width: 115,
    field: 'af_nhlbi_esp',
    filter: 'number',
    unSortIcon: true,
  },
  {
    headerName: 'ClinVar clin. sig. variants',
    headerTooltip: 'ClinVar clinically significant variants',
    width: 105,
    field: 'clinvar_sig_variants',
    suppressSorting: true,
    filter: 'text',
    cellRendererFramework: ClinVarCellRenderer
  },
  {
    headerName: 'Genome Trax ChIP-Seq description',
    headerTooltip: 'Genome Trax ChIP-Seq description',
    width: 105,
    field: 'gtx_chipseq',
    suppressSorting: true,
    filter: 'text',
    cellRendererFramework: ObjectCountCellRenderer
  },
  {
    headerName: 'Genome Trax disease assocation description',
    width: 265,
    field: 'gtx_disease',
    suppressSorting: true,
    filter: 'text',
    cellRendererFramework: ArrayCellRenderer
  },
  {
    headerName: 'Genome Trax HGMD disease genes description',
    width: 105,
    field: 'gtx_hgmd_disgene',
    suppressSorting: true,
    filter: 'text',
    cellRendererFramework: ObjectCountCellRenderer
  },
  {
    headerName: 'Genome Trax HGMD inherited disease genes description',
    width: 105,
    field: 'gtx_hgmd',
    suppressSorting: true,
    filter: 'text',
    cellRendererFramework: ObjectCountCellRenderer
  },
  {
    headerName: 'Genome Trax OMIM disorders',
    width: 105,
    field: 'gtx_omim',
    suppressSorting: true,
    filter: 'text',
    cellRendererFramework: ObjectCountCellRenderer
  },
  {
    headerName: 'Transcription factor binding sites using ChIP-seq from ENCODE',
    width: 115,
    field: 'encode_tfbs',
    suppressSorting: true,
    filter: 'text',
    cellRendererFramework: ArrayCountCellRenderer
  },
  {
    headerName: 'Simple tandem repeats',
    field: 'simple_repeat',
    filter: 'text',
    cellRendererFramework: LongTextCellRenderer,
    unSortIcon: true,
  },
  {
    headerName: 'Segments detected as putative genomic duplications',
    field: 'segment_dups',
    filter: 'text',
    cellRendererFramework: LongTextCellRenderer,
    unSortIcon: true,
  },
  {
    headerName: 'Regions detected as interspersed repeats and low complexity DNA sequences',
    field: 'repeat_masker',
    filter: 'text',
    cellRendererFramework: LongTextCellRenderer,
    unSortIcon: true,
  },
  {
    headerName: 'Freeze set filter',
    width: 220,
    field: 'freeze_filter',
    filter: 'text',
    suppressSorting: true,
    hide: true,
    cellRendererFramework: DynamicFieldCellRenderer
  },
  {
    headerName: 'Zygosity',
    width: 95,
    field: 'zygosity',
    filter: 'text',
    suppressSorting: true,
    hide: true,
    cellRendererFramework: DynamicFieldCellRenderer
  }
];

const VariantsTableDefaultColDef = {
  unSortIcon: true,
  filter: 'text',
  filterParams: {
    textFormatter: (val) => val, /* ag-grid will by default lowercase the input string, which we don't want */
    applyButton: true,
  }
}

export { VariantsTableColumnDefs, VariantsTableDefaultColDef};
