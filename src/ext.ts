export default function ext() {

  const support = {
    snapshot: true,
    export: false,
    sharing: false,
    exportData: false,
    viewData: false,
    quickMobile: true,
    showDetails: false,
  };
  
  return {
    importProperties: null,
    exportProperties: null,
    support,
  };
}
