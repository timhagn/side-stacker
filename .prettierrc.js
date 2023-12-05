module.exports = {
  plugins: ['@trivago/prettier-plugin-sort-imports'],
  semi: false,
  singleQuote: true,
  importOrder: ['<THIRD_PARTY_MODULES>', '^@*/(.*)$', '^[./]'],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
  importOrderGroupNamespaceSpecifiers: true,
}
