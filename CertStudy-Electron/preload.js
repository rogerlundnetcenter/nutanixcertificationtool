const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('certStudy', {
  quiz: {
    loadExams: (dataDir) => ipcRenderer.invoke('quiz:load-exams', dataDir),
    getBlueprint: (examCode) => ipcRenderer.invoke('quiz:get-blueprint', examCode),
    calculateCoverage: (examCode, questionTexts) =>
      ipcRenderer.invoke('quiz:calculate-coverage', examCode, questionTexts),
    getObjectivesForQuestion: (examCode, text) =>
      ipcRenderer.invoke('quiz:get-objectives', examCode, text),
    getReferences: (examCode, text) =>
      ipcRenderer.invoke('quiz:get-references', examCode, text),
    getKBLinks: (examCode, text) =>
      ipcRenderer.invoke('quiz:get-kb-links', examCode, text),
    getGeneralResources: (examCode) =>
      ipcRenderer.invoke('quiz:get-general-resources', examCode),
  },

  pdf: {
    exportExam: (examName, questions, includeAnswers, outputPath) =>
      ipcRenderer.invoke('pdf:export-exam', examName, questions, includeAnswers, outputPath),
    exportAll: (exams, includeAnswers, outputPath) =>
      ipcRenderer.invoke('pdf:export-all', exams, includeAnswers, outputPath),
  },

  fs: {
    chooseDataDirectory: () => ipcRenderer.invoke('fs:choose-data-dir'),
    showSaveDialog: (options) => ipcRenderer.invoke('fs:show-save-dialog', options),
    openExternal: (filePath) => ipcRenderer.invoke('fs:open-external', filePath),
  },

  store: {
    get: (key) => ipcRenderer.invoke('store:get', key),
    set: (key, value) => ipcRenderer.invoke('store:set', key, value),
  },

  lab: {
    send: (type, payload) => ipcRenderer.invoke('lab:message', type, payload),
    post: (type, payload) => ipcRenderer.send('lab:notify', type, payload),
    onMessage: (callback) => {
      const handler = (_event, data) => callback(data);
      ipcRenderer.on('lab:from-main', handler);
      return () => ipcRenderer.removeListener('lab:from-main', handler);
    },
  },

  app: {
    getVersion: () => ipcRenderer.invoke('app:get-version'),
    getPlatform: () => ipcRenderer.invoke('app:get-version').then(v => v.platform),
  },
});
