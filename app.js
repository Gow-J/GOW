/* =========================================================
   像素工坊 · Pixel Forge
   Vanilla JS image pipeline. All processing stays in the browser.
   ========================================================= */

(() => {
  "use strict";

  const MAX_FILE_BYTES = 30 * 1024 * 1024;
  const MAX_SOURCE_MEGAPIXELS = 90;
  const MAX_PROCESS_EDGE = 2000;
  const MIN_PIXEL_SIZE = 8;
  const MAX_PIXEL_SIZE = 256;
  const PRESET_SIZES = [16, 32, 48, 64, 96, 128];
  const SCALE_OPTIONS = [1, 2, 4, 8];
  const STORAGE_KEY = "pixel-forge.prefs.v1";
  const DEFAULT_PREFS = {
    size: 64,
    tolerance: 55,
    scale: 1,
    lang: "zh"
  };

  const I18N = {
    zh: {
      appTitle: "像素工坊 · 把照片变成像素画",
      appTitleWithFile: "{file} · 像素工坊",
      metaDescription: "像素工坊 —— 在浏览器本地把 JPG / PNG 图片变成像素画。自由选择像素尺寸，一键去除背景，导出透明 PNG。",
      brandName: "像素工坊",
      brandSub: "PIXEL FORGE <i>/ 01</i>",
      privacyTitle: "所有图片只在当前浏览器本地处理，不会上传",
      privacyFull: "本地处理 · 图片不上传",
      privacyShort: "本地处理",
      languageAria: "界面语言",
      helpButtonAria: "打开使用说明",
      helpButtonTitle: "使用说明",
      settingsAria: "像素画设置",

      importTitle: "导入图片",
      dropTitleHtml: '拖入图片，或<span class="accent-text">点击选择</span>',
      uploadHint: "支持 JPG / PNG · 单张最大 30 MB",
      replaceImage: "更换",
      clearImage: "移除图片",
      pasteTipHtml: "也可按 <kbd>Ctrl</kbd> + <kbd>V</kbd> 粘贴",
      dropzoneAriaDefault: "拖入图片或点击选择，支持 JPG 和 PNG",
      dropzoneAriaChange: "{name}，点击更换图片",

      sizeTitle: "像素尺寸",
      longestEdge: "长边像素",
      presetGroupAria: "像素尺寸预设",
      customSize: "自定义尺寸",
      customSizeAria: "自定义像素尺寸",
      sizeSliderAria: "调整像素尺寸",
      outputSizeLabel: "生成尺寸",
      outputSizeNoImage: "{size} px 长边",

      backgroundTitle: "背景处理",
      backgroundMeta: "可选",
      removeBg: "去除背景",
      removeBgHint: "自动识别纯色 / 简单背景",
      resetAuto: "恢复自动",
      toleranceLabel: "识别容差",
      toleranceAria: "背景识别容差",
      toleranceHelp: "数值越大，去除范围越广；过高可能误删主体。背景复杂时建议用吸管取色。",
      sampleBg: "吸取背景色",
      sampleAgain: "重新取色",
      cancelPicking: "取消取色",
      sampleHintInline: "背景不纯时试试手动取色",
      scrollCueAria: "向下滚动查看更多设置",
      scrollCueText: "向下滚动 · 更多设置",

      exportTitle: "导出",
      exportScaleAria: "导出倍率",
      downloadPng: "下载 PNG",
      exportNoteNoImage: "选择图片后即可导出 PNG。",
      exportNoteBg: "透明背景会保留在 PNG 中。",
      exportNoteDefault: "导出无损 PNG，原图的透明区域也会保留。",

      stageAria: "像素画预览",
      viewModeAria: "预览方式",
      viewCompare: "对比",
      viewResult: "像素画",
      viewOriginal: "原图",
      gridLabel: "像素网格",
      emptyTitleHtml: "把照片，变成<br><span>像素艺术。</span>",
      emptyDescriptionHtml: "拖入一张 JPG 或 PNG 图片，选择想要的像素尺寸。<br>还可以一键去掉背景，导出透明 PNG。",
      chooseImage: "选择一张图片",
      emptyFootnote: "所有运算都在你的浏览器中完成",
      originalPreviewAlt: "原图预览",
      canvasPreviewAria: "像素画结果预览",
      splitAria: "原图与像素画对比位置",
      splitValueText: "左侧显示原图 {left}%，右侧显示像素画 {right}%",
      originalLabel: "原图",
      resultLabel: "像素画",
      samplingInstruction: "点击图片中的背景区域取色",
      cancel: "取消",
      stageHintCompare: "拖动分割线，对比处理前后",
      stageHintResult: "当前为像素画结果 · 导出 PNG 保持清晰",
      stageHintOriginal: "当前为原图预览",
      processingGenerating: "正在生成像素画…",
      processingReading: "正在读取图片…",
      statOriginal: "原图",
      statOutput: "输出",
      statColors: "颜色",
      statTransparent: "透明",
      waitingImport: "等待导入",

      dropOverlayTitle: "松手，开始像素化",
      dropOverlaySub: "支持 JPG / PNG · 图片不会被上传",
      helpCloseAria: "关闭使用说明",
      helpTitle: "三步，把照片变成像素画",
      helpLead: "不用安装插件，也不用上传图片。所有处理都在当前浏览器标签页里完成。",
      helpStep1Title: "导入图片",
      helpStep1Text: "拖入、点击选择，或直接按 Ctrl + V 粘贴一张 JPG / PNG 图片。",
      helpStep2Title: "选择像素尺寸",
      helpStep2Text: "“长边像素”决定最终图形最长边的像素数量。例如 64 会把图片转换成 64×N 或 N×64 的像素画。",
      helpStep3Title: "去背景并导出",
      helpStep3Text: "打开“去除背景”，调整容差，或使用吸管点击背景取色。最后下载透明背景的 PNG。",
      helpTipHtml: "<strong>背景去除适合纯色或简单背景。</strong>背景越复杂，越建议先用吸管点选主要背景色，再微调容差；必要时降低容差以保留主体。对比视图里可以拖动中线查看效果。",
      helpShortcutDrag: "<kbd>拖拽</kbd> 替换图片",
      helpShortcutPaste: "<kbd>Ctrl</kbd> + <kbd>V</kbd> 粘贴图片",
      helpShortcutDownload: "<kbd>Ctrl</kbd> + <kbd>S</kbd> 下载 PNG",
      helpShortcutEsc: "<kbd>Esc</kbd> 取消取色",
      startCreating: "开始创作",

      detectNoImage: "导入图片后可自动识别背景",
      detectManual: "手动取色 {color} · 容差 {tolerance}",
      detectTransparent: "图片本身已有透明背景",
      detectBusy: "背景较杂 · 建议降低容差或手动取色",
      detectBusyTitle: "自动识别 {color}，边缘覆盖 {coverage}%",
      detectAuto: "自动识别 {color} · 边缘覆盖 {coverage}%",
      detectUnknown: "未识别到背景色，请用吸管取色",
      resultCanvasAria: "像素画结果预览，{width} × {height} 像素，{colors} 种颜色",
      errorUnsupported: "仅支持 JPG 和 PNG 图片，请换一张试试。",
      errorTooLarge: "图片超过 30 MB，请压缩后再试。",
      errorEmptyImage: "图片尺寸为空。",
      errorTooManyPixels: "图片尺寸过大（{width} × {height}），请先压缩到 9000 万像素以内。",
      errorCannotReadPixels: "无法读取图片像素。",
      errorSecurity: "浏览器阻止了像素读取。请把图片拖入页面后再试一次。",
      errorCannotReadImage: "无法读取这张图片，请换一张 JPG 或 PNG 试试。",
      errorGenerate: "生成失败，请尝试更小的像素尺寸或更换图片。",
      errorDownload: "导出失败，请稍后重试。",
      errorCreatePng: "无法创建 PNG 文件。",
      errorClipboardType: "剪贴板里不是 JPG 或 PNG 图片。",
      errorTransparentSample: "这个位置是透明的，请点击不透明的背景区域。",
      multipleFiles: "一次处理一张图片，已载入第一张。",
      infoComplexBackground: "背景比较复杂，自动去除可能误删主体；建议降低容差或手动取色。",
      successResetAuto: "已恢复自动背景识别。",
      successSampled: "已取样背景色 {color}。",
      successExported: "已导出 {width} × {height} px 的 PNG。",
      successCleared: "图片已移除，可以换一张继续。",
      untitledImage: "粘贴的图片",
      downloadFallbackName: "像素画",
      pasteFileName: "粘贴图片-{time}"
    },

    en: {
      appTitle: "Pixel Forge · Turn photos into pixel art",
      appTitleWithFile: "{file} · Pixel Forge",
      metaDescription: "Pixel Forge turns JPG and PNG photos into pixel art right in your browser. Choose the pixel size, remove the background, and export a transparent PNG.",
      brandName: "Pixel Forge",
      brandSub: "PIXEL STUDIO <i>/ 01</i>",
      privacyTitle: "Images are processed locally in this browser and never uploaded",
      privacyFull: "On-device · no uploads",
      privacyShort: "On-device",
      languageAria: "Interface language",
      helpButtonAria: "Open help",
      helpButtonTitle: "Help",
      settingsAria: "Pixel art settings",

      importTitle: "Import image",
      dropTitleHtml: 'Drop an image or <span class="accent-text">browse</span>',
      uploadHint: "JPG / PNG · up to 30 MB",
      replaceImage: "Replace",
      clearImage: "Remove image",
      pasteTipHtml: "or press <kbd>Ctrl</kbd> + <kbd>V</kbd> to paste",
      dropzoneAriaDefault: "Drop an image or click to choose a JPG or PNG",
      dropzoneAriaChange: "{name} — click to replace image",

      sizeTitle: "Pixel size",
      longestEdge: "LONGEST EDGE",
      presetGroupAria: "Pixel size presets",
      customSize: "Custom size",
      customSizeAria: "Custom pixel size",
      sizeSliderAria: "Adjust pixel size",
      outputSizeLabel: "Output size",
      outputSizeNoImage: "{size} px longest edge",

      backgroundTitle: "Background",
      backgroundMeta: "OPTIONAL",
      removeBg: "Remove background",
      removeBgHint: "Auto-detects solid or simple backgrounds",
      resetAuto: "Reset auto",
      toleranceLabel: "Tolerance",
      toleranceAria: "Background detection tolerance",
      toleranceHelp: "Higher values remove a wider color range. Too high may erase the subject. Use the eyedropper for complex backgrounds.",
      sampleBg: "Pick background",
      sampleAgain: "Pick again",
      cancelPicking: "Cancel picking",
      sampleHintInline: "Use the eyedropper for uneven backgrounds",
      scrollCueAria: "Scroll down for more settings",
      scrollCueText: "Scroll for more settings",

      exportTitle: "Export",
      exportScaleAria: "Export scale",
      downloadPng: "Download PNG",
      exportNoteNoImage: "Choose an image to export a PNG.",
      exportNoteBg: "The transparent background is kept in the PNG.",
      exportNoteDefault: "Exports a lossless PNG; existing transparency is preserved.",

      stageAria: "Pixel art preview",
      viewModeAria: "Preview mode",
      viewCompare: "Compare",
      viewResult: "Pixel art",
      viewOriginal: "Original",
      gridLabel: "Grid",
      emptyTitleHtml: "Turn photos into<br><span>pixel art.</span>",
      emptyDescriptionHtml: "Drop a JPG or PNG, choose your pixel size,<br>remove the background, and export a transparent PNG.",
      chooseImage: "Choose an image",
      emptyFootnote: "Everything runs in your browser",
      originalPreviewAlt: "Original image preview",
      canvasPreviewAria: "Pixel art result preview",
      splitAria: "Comparison position between original and pixel art",
      splitValueText: "Original on the left {left}%, pixel art on the right {right}%",
      originalLabel: "Original",
      resultLabel: "Pixel art",
      samplingInstruction: "Click background to pick a color",
      cancel: "Cancel",
      stageHintCompare: "Drag the divider to compare before and after",
      stageHintResult: "Pixel art result · export a crisp PNG",
      stageHintOriginal: "Original image preview",
      processingGenerating: "Creating pixel art…",
      processingReading: "Reading image…",
      statOriginal: "Original",
      statOutput: "Output",
      statColors: "Colors",
      statTransparent: "Transparent",
      waitingImport: "Waiting",

      dropOverlayTitle: "Drop to start pixelizing",
      dropOverlaySub: "JPG / PNG · your image never leaves this device",
      helpCloseAria: "Close help",
      helpTitle: "Three steps to pixel art",
      helpLead: "No plugins, no uploads. Everything happens in this browser tab.",
      helpStep1Title: "Import an image",
      helpStep1Text: "Drop it in, browse for a file, or paste a JPG / PNG with Ctrl + V.",
      helpStep2Title: "Choose a pixel size",
      helpStep2Text: "“Longest edge” sets the final resolution. For example, 64 turns your image into a 64×N or N×64 pixel artwork.",
      helpStep3Title: "Remove the background & export",
      helpStep3Text: "Turn on Remove background, adjust the tolerance, or use the eyedropper to pick a color. Then download a transparent PNG.",
      helpTipHtml: "<strong>Background removal works best on solid or simple backgrounds.</strong> For busier images, pick the main background color with the eyedropper first, then fine-tune the tolerance. Lower it if the subject starts to disappear. Drag the midline in Compare to inspect the result.",
      helpShortcutDrag: "<kbd>Drag</kbd> replace image",
      helpShortcutPaste: "<kbd>Ctrl</kbd> + <kbd>V</kbd> paste an image",
      helpShortcutDownload: "<kbd>Ctrl</kbd> + <kbd>S</kbd> download PNG",
      helpShortcutEsc: "<kbd>Esc</kbd> cancel picking",
      startCreating: "Start creating",

      detectNoImage: "Import an image to detect its background",
      detectManual: "Manual color {color} · tolerance {tolerance}",
      detectTransparent: "Image already has a transparent background",
      detectBusy: "Busy background · try the eyedropper",
      detectBusyTitle: "Detected {color}, edge coverage {coverage}%",
      detectAuto: "Detected {color} · edge coverage {coverage}%",
      detectUnknown: "No background color found. Use the eyedropper.",
      resultCanvasAria: "Pixel art preview, {width} × {height} pixels, {colors} colors",
      errorUnsupported: "Only JPG and PNG images are supported. Try another file.",
      errorTooLarge: "This image is over 30 MB. Please compress it and try again.",
      errorEmptyImage: "The image has no dimensions.",
      errorTooManyPixels: "The image is too large ({width} × {height}). Please reduce it below 90 megapixels.",
      errorCannotReadPixels: "Unable to read the image pixels.",
      errorSecurity: "The browser blocked pixel access. Drag the image into the page and try again.",
      errorCannotReadImage: "Couldn't read that image. Try another JPG or PNG.",
      errorGenerate: "Generation failed. Try a smaller pixel size or a different image.",
      errorDownload: "Export failed. Please try again.",
      errorCreatePng: "Couldn't create the PNG file.",
      errorClipboardType: "The clipboard doesn't contain a JPG or PNG image.",
      errorTransparentSample: "That spot is transparent. Click an opaque background area.",
      multipleFiles: "One image at a time. Loaded the first image.",
      infoComplexBackground: "This background is complex. Auto removal may clip the subject. Try a lower tolerance or manual color picking.",
      successResetAuto: "Automatic background detection restored.",
      successSampled: "Sampled background color {color}.",
      successExported: "Exported a {width} × {height} px PNG.",
      successCleared: "Image removed. Choose another to continue.",
      untitledImage: "Pasted image",
      downloadFallbackName: "image",
      pasteFileName: "pasted-image-{time}"
    }
  };

  const dom = {};

  const state = {
    lang: DEFAULT_PREFS.lang,
    languageApplied: false,
    processingKey: "processingGenerating",
    img: null,
    fileName: "",
    fileSize: 0,
    fileType: "",
    sourceUrl: "",
    originalWidth: 0,
    originalHeight: 0,
    sourceData: null,
    sourceVersion: 0,
    ready: false,
    busy: false,

    size: DEFAULT_PREFS.size,
    tolerance: DEFAULT_PREFS.tolerance,
    scale: DEFAULT_PREFS.scale,
    removeBg: false,
    gridOn: false,
    view: "compare",

    bgInfo: null,
    manualBg: null,
    manualSeed: null,
    alphaCache: null,
    alphaCacheKey: "",

    outputW: 0,
    outputH: 0,
    resultColors: 0,
    transparentPercent: 0,
    lastRenderKey: "",

    sampling: false,
    previousView: "compare",
    split: 50,
    dragging: false,
    splitPointerId: null,

    loadToken: 0,
    renderSequence: 0,
    renderTimer: 0,
    saveTimer: 0,
    fitFrame: 0
  };

  let resizeObserver = null;

  document.addEventListener("DOMContentLoaded", init);

  function init() {
    cacheDom();
    loadPrefs();
    bindStaticEvents();
    buildPresetButtons();
    buildScaleButtonsState();
    syncSizeUi();
    syncToleranceUi();
    syncScaleUi();
    setView("compare", { silent: true });
    updateDimsUi();
    updateBackgroundUi();
    updateGridUi();
    updateActionState();
    applyLanguage(state.lang, { force: true });
    queueSidebarScrollState();

    dom.originalImage.draggable = false;

    if ("ResizeObserver" in window) {
      resizeObserver = new ResizeObserver(scheduleFit);
      resizeObserver.observe(dom.previewArea);
    } else {
      window.addEventListener("resize", scheduleFit);
    }
  }

  function cacheDom() {
    const ids = [
      "fileInput",
      "dropzone",
      "dropzoneEmpty",
      "fileCard",
      "fileThumb",
      "fileName",
      "fileDetail",
      "clearButton",
      "presetGrid",
      "sizeInput",
      "sizeSlider",
      "outputDims",
      "bgToggle",
      "bgDetails",
      "bgSwatch",
      "bgDetect",
      "resetAutoButton",
      "toleranceRange",
      "toleranceValue",
      "sampleButton",
      "sampleButtonLabel",
      "scaleGroup",
      "exportDims",
      "downloadButton",
      "downloadSub",
      "exportNote",
      "gridButton",
      "previewArea",
      "emptyState",
      "stageArea",
      "sidebarScroll",
      "scrollCue",
      "stageFrame",
      "originalImage",
      "resultLayer",
      "resultCanvas",
      "pixelGrid",
      "splitLine",
      "splitHandle",
      "originalLabel",
      "resultLabel",
      "resultLabelSize",
      "samplingBanner",
      "cancelSampleButton",
      "stageHint",
      "processingOverlay",
      "processingText",
      "statSource",
      "statOutput",
      "statColors",
      "statAlpha",
      "emptyUpload",
      "helpButton",
      "helpDialog",
      "languageSwitch",
      "dropOverlay",
      "toastStack"
    ];

    for (const id of ids) {
      dom[id] = document.getElementById(id);
    }

    dom.viewTabs = Array.from(document.querySelectorAll(".view-tab"));
    dom.languageButtons = Array.from(document.querySelectorAll(".language-button"));
    dom.sidebar = document.querySelector(".sidebar");
  }

  /* -------------------------------------------------------
     Preferences
     ------------------------------------------------------- */

  function loadPrefs() {
    let prefs = { ...DEFAULT_PREFS };

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      if (parsed && typeof parsed === "object") {
        prefs = { ...prefs, ...parsed };
      }
    } catch {
      /* Private mode or blocked storage: defaults are fine. */
    }

    state.size = clampInt(prefs.size, MIN_PIXEL_SIZE, MAX_PIXEL_SIZE, DEFAULT_PREFS.size);
    state.tolerance = clampInt(prefs.tolerance, 0, 100, DEFAULT_PREFS.tolerance);
    state.scale = SCALE_OPTIONS.includes(Number(prefs.scale)) ? Number(prefs.scale) : DEFAULT_PREFS.scale;
    state.lang = prefs.lang === "en" ? "en" : "zh";
  }

  function queueSavePrefs() {
    clearTimeout(state.saveTimer);
    state.saveTimer = window.setTimeout(savePrefs, 250);
  }

  function savePrefs() {
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          size: state.size,
          tolerance: state.tolerance,
          scale: state.scale,
          lang: state.lang
        })
      );
    } catch {
      /* Non-critical. */
    }
  }

  /* -------------------------------------------------------
     Language / translations
     ------------------------------------------------------- */

  function t(key, vars) {
    const table = I18N[state.lang] || I18N.zh;
    let text = table[key];

    if (text === undefined) text = I18N.zh[key];
    if (text === undefined) return key;

    if (vars) {
      text = text.replace(/\{(\w+)\}/g, (match, name) =>
        Object.prototype.hasOwnProperty.call(vars, name) ? String(vars[name]) : match
      );
    }

    return text;
  }

  function applyLanguage(lang, options = {}) {
    const next = lang === "en" ? "en" : "zh";
    const { force = false, persist = false } = options;

    if (!force && state.languageApplied && next === state.lang) return;

    state.lang = next;
    state.languageApplied = true;

    document.documentElement.lang = next === "zh" ? "zh-CN" : "en";
    document.documentElement.dataset.lang = next;

    applyStaticTranslations();
    syncLanguageSwitch();
    refreshLanguageDependentUi();

    if (persist) savePrefs();
  }

  function applyStaticTranslations() {
    document.querySelectorAll("[data-i18n]").forEach((element) => {
      element.textContent = t(element.dataset.i18n);
    });

    document.querySelectorAll("[data-i18n-html]").forEach((element) => {
      element.innerHTML = t(element.dataset.i18nHtml);
    });

    const attributeBindings = [
      ["data-i18n-aria-label", "aria-label"],
      ["data-i18n-title", "title"],
      ["data-i18n-alt", "alt"]
    ];

    for (const [sourceAttribute, targetAttribute] of attributeBindings) {
      document.querySelectorAll(`[${sourceAttribute}]`).forEach((element) => {
        element.setAttribute(targetAttribute, t(element.getAttribute(sourceAttribute)));
      });
    }

    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) metaDescription.setAttribute("content", t("metaDescription"));
  }

  function syncLanguageSwitch() {
    for (const button of dom.languageButtons) {
      const active = button.dataset.lang === state.lang;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", active ? "true" : "false");
    }

    if (dom.languageSwitch) {
      dom.languageSwitch.setAttribute("data-lang", state.lang);
    }
  }

  function refreshLanguageDependentUi() {
    updateDocumentTitle();
    updateDimsUi();
    updateBackgroundUi();
    updateStageHint();
    updateActionState();
    updateSplitUi(state.split);
    updateDropzoneAria();
    updateResultCanvasAria();
    updateProcessingText();
    queueSidebarScrollState();
  }

  function updateDocumentTitle() {
    document.title = state.sourceData
      ? t("appTitleWithFile", { file: state.fileName })
      : t("appTitle");
  }

  function updateDropzoneAria() {
    if (!dom.dropzone) return;

    dom.dropzone.setAttribute(
      "aria-label",
      state.sourceData
        ? t("dropzoneAriaChange", { name: state.fileName })
        : t("dropzoneAriaDefault")
    );
  }

  function updateResultCanvasAria() {
    if (!dom.resultCanvas) return;

    if (state.outputW && state.outputH) {
      dom.resultCanvas.setAttribute(
        "aria-label",
        t("resultCanvasAria", {
          width: state.outputW,
          height: state.outputH,
          colors: formatNumber(state.resultColors)
        })
      );
    } else {
      dom.resultCanvas.setAttribute("aria-label", t("canvasPreviewAria"));
    }
  }

  function updateProcessingText() {
    if (!dom.processingText) return;
    dom.processingText.textContent = t(state.processingKey || "processingGenerating");
  }

  /* -------------------------------------------------------
     Static event wiring
     ------------------------------------------------------- */

  function bindStaticEvents() {
    dom.dropzone.addEventListener("click", () => dom.fileInput.click());
    dom.emptyUpload.addEventListener("click", () => dom.fileInput.click());

    dom.fileInput.addEventListener("change", (event) => {
      const file = event.target.files && event.target.files[0];
      event.target.value = "";
      if (file) loadFile(file);
    });

    dom.languageSwitch.addEventListener("click", (event) => {
      const button = event.target.closest("[data-lang]");
      if (!button || !dom.languageSwitch.contains(button)) return;
      applyLanguage(button.dataset.lang, { persist: true });
    });

    dom.clearButton.addEventListener("click", clearImage);

    dom.sizeSlider.addEventListener("input", () => {
      setSize(dom.sizeSlider.value, "slider");
    });

    dom.sidebarScroll.addEventListener("scroll", updateSidebarScrollState, { passive: true });
    dom.scrollCue.addEventListener("click", () => {
      dom.sidebarScroll.scrollTo({
        top: dom.sidebarScroll.scrollHeight,
        behavior: prefersReducedMotion() ? "auto" : "smooth"
      });
    });

    dom.sizeInput.addEventListener("input", () => {
      const raw = dom.sizeInput.value.trim();
      const value = Number(raw);

      if (Number.isInteger(value) && value >= MIN_PIXEL_SIZE && value <= MAX_PIXEL_SIZE) {
        dom.sizeInput.removeAttribute("aria-invalid");
        setSize(value, "number");
      } else {
        dom.sizeInput.setAttribute("aria-invalid", "true");
      }
    });

    dom.sizeInput.addEventListener("blur", normalizeSizeInput);
    dom.sizeInput.addEventListener("change", normalizeSizeInput);
    dom.sizeInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        normalizeSizeInput();
        dom.sizeInput.blur();
      }
    });

    dom.toleranceRange.addEventListener("input", () => {
      setTolerance(dom.toleranceRange.value);
    });

    dom.bgToggle.addEventListener("click", toggleBackgroundRemoval);
    dom.sampleButton.addEventListener("click", toggleSampling);
    dom.cancelSampleButton.addEventListener("click", (event) => {
      event.stopPropagation();
      cancelSampling();
    });
    dom.resetAutoButton.addEventListener("click", resetAutoBackground);

    dom.downloadButton.addEventListener("click", downloadPng);

    dom.gridButton.addEventListener("click", () => {
      if (!state.ready) return;
      state.gridOn = !state.gridOn;
      updateGridUi();
    });

    for (const tab of dom.viewTabs) {
      tab.addEventListener("click", () => {
        if (!tab.disabled) setView(tab.dataset.view);
      });
      tab.addEventListener("keydown", handleTabKeydown);
    }

    dom.scaleGroup.addEventListener("click", (event) => {
      const button = event.target.closest("[data-scale]");
      if (!button) return;
      setScale(Number(button.dataset.scale));
    });

    dom.helpButton.addEventListener("click", () => {
      if (state.sampling) cancelSampling();
      if (typeof dom.helpDialog.showModal === "function") {
        dom.helpDialog.showModal();
      } else {
        dom.helpDialog.setAttribute("open", "");
      }
    });

    dom.helpDialog.addEventListener("click", (event) => {
      if (event.target !== dom.helpDialog) return;
      const rect = dom.helpDialog.getBoundingClientRect();
      const outside =
        event.clientX < rect.left ||
        event.clientX > rect.right ||
        event.clientY < rect.top ||
        event.clientY > rect.bottom;
      if (outside) dom.helpDialog.close();
    });

    dom.stageFrame.addEventListener("pointerdown", handleStagePointerDown);
    dom.stageFrame.addEventListener("pointermove", handleStagePointerMove);
    dom.stageFrame.addEventListener("pointerup", endStageDrag);
    dom.stageFrame.addEventListener("pointercancel", endStageDrag);
    dom.stageFrame.addEventListener("click", handleStageClick);
    dom.splitHandle.addEventListener("keydown", handleSplitKeydown);

    window.addEventListener("keydown", handleGlobalKeydown);
    document.addEventListener("paste", handlePaste);

    window.addEventListener("dragenter", handleDragEnter);
    window.addEventListener("dragover", handleDragOver);
    window.addEventListener("dragleave", handleDragLeave);
    window.addEventListener("drop", handleDrop);
    window.addEventListener("blur", hideDropOverlay);

    window.addEventListener("resize", scheduleFit);
    window.addEventListener("resize", queueSidebarScrollState);
    window.addEventListener("beforeunload", () => {
      if (state.sourceUrl) URL.revokeObjectURL(state.sourceUrl);
    });
  }

  /* -------------------------------------------------------
     Size controls
     ------------------------------------------------------- */

  function buildPresetButtons() {
    const fragment = document.createDocumentFragment();

    for (const size of PRESET_SIZES) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "preset-button";
      button.dataset.size = String(size);
      button.setAttribute("aria-pressed", "false");
      button.innerHTML = `${size}<span>px</span>`;
      button.addEventListener("click", () => setSize(size, "preset"));
      fragment.appendChild(button);
    }

    dom.presetGrid.replaceChildren(fragment);
  }

  function setSize(value, source) {
    const next = Math.round(Number(value));
    if (!Number.isFinite(next)) return false;

    if (next < MIN_PIXEL_SIZE || next > MAX_PIXEL_SIZE) {
      return false;
    }

    state.size = next;

    if (source !== "number") {
      dom.sizeInput.value = String(next);
      dom.sizeInput.removeAttribute("aria-invalid");
    }

    dom.sizeSlider.value = String(next);
    setRangeFill(dom.sizeSlider, next, MIN_PIXEL_SIZE, MAX_PIXEL_SIZE);
    syncPresetButtons();
    updateDimsUi();
    queueSavePrefs();
    scheduleRender();
    return true;
  }

  function normalizeSizeInput() {
    const raw = dom.sizeInput.value.trim();
    const value = Number(raw);

    if (Number.isInteger(value) && value >= MIN_PIXEL_SIZE && value <= MAX_PIXEL_SIZE) {
      dom.sizeInput.removeAttribute("aria-invalid");
      setSize(value, "normalize");
    } else {
      dom.sizeInput.value = String(state.size);
      dom.sizeInput.removeAttribute("aria-invalid");
    }
  }

  function syncSizeUi() {
    dom.sizeInput.value = String(state.size);
    dom.sizeInput.removeAttribute("aria-invalid");
    dom.sizeSlider.value = String(state.size);
    setRangeFill(dom.sizeSlider, state.size, MIN_PIXEL_SIZE, MAX_PIXEL_SIZE);
    syncPresetButtons();
    updateDimsUi();
  }

  function syncPresetButtons() {
    const buttons = dom.presetGrid.querySelectorAll(".preset-button");
    for (const button of buttons) {
      const active = Number(button.dataset.size) === state.size;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", active ? "true" : "false");
    }
  }

  /* -------------------------------------------------------
     Tolerance + export scale
     ------------------------------------------------------- */

  function setTolerance(value) {
    const next = clampInt(value, 0, 100, state.tolerance);
    state.tolerance = next;
    syncToleranceUi();
    queueSavePrefs();
    scheduleRender();
  }

  function syncToleranceUi() {
    dom.toleranceRange.value = String(state.tolerance);
    dom.toleranceValue.value = String(state.tolerance);
    dom.toleranceValue.textContent = String(state.tolerance);
    setRangeFill(dom.toleranceRange, state.tolerance, 0, 100);
  }

  function setScale(value) {
    if (!SCALE_OPTIONS.includes(value)) return;
    state.scale = value;
    syncScaleUi();
    updateDimsUi();
    updateActionState();
    queueSavePrefs();
  }

  function buildScaleButtonsState() {
    syncScaleUi();
  }

  function syncScaleUi() {
    const buttons = dom.scaleGroup.querySelectorAll("[data-scale]");
    for (const button of buttons) {
      const active = Number(button.dataset.scale) === state.scale;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", active ? "true" : "false");
    }
  }

  function setRangeFill(element, value, min, max) {
    const percent = max === min ? 0 : ((value - min) / (max - min)) * 100;
    element.style.setProperty("--fill", `${clamp(percent, 0, 100)}%`);
  }

  /* -------------------------------------------------------
     Dimensions and labels
     ------------------------------------------------------- */

  function getOutputDimensions() {
    if (!state.sourceData) return null;

    const sw = state.sourceData.width;
    const sh = state.sourceData.height;
    const longEdge = state.size;

    let width;
    let height;

    if (sw >= sh) {
      width = longEdge;
      height = Math.max(1, Math.round((longEdge * sh) / sw));
    } else {
      height = longEdge;
      width = Math.max(1, Math.round((longEdge * sw) / sh));
    }

    return { width, height };
  }

  function updateDimsUi() {
    const dims = getOutputDimensions();
    const exportDims = dims
      ? { width: dims.width * state.scale, height: dims.height * state.scale }
      : null;

    if (dims) {
      dom.outputDims.textContent = `${dims.width} × ${dims.height} px`;
      dom.statOutput.textContent = `${dims.width} × ${dims.height} px`;
      dom.resultLabelSize.textContent = `${dims.width} × ${dims.height}`;
      dom.exportDims.textContent = `${exportDims.width} × ${exportDims.height} px`;
      dom.downloadSub.textContent = `${exportDims.width} × ${exportDims.height}`;
    } else {
      dom.outputDims.textContent = t("outputSizeNoImage", { size: state.size });
      dom.statOutput.textContent = "—";
      dom.resultLabelSize.textContent = String(state.size);
      dom.exportDims.textContent = "—";
      dom.downloadSub.textContent = "—";
    }

    if (!state.sourceData) {
      dom.statSource.textContent = t("waitingImport");
      dom.statColors.textContent = "—";
      dom.statAlpha.textContent = "—";
      dom.exportNote.textContent = t("exportNoteNoImage");
    } else if (state.removeBg) {
      dom.exportNote.textContent = t("exportNoteBg");
    } else {
      dom.exportNote.textContent = t("exportNoteDefault");
    }
  }

  function formatNumber(value) {
    try {
      return new Intl.NumberFormat(state.lang === "en" ? "en-US" : "zh-CN").format(value);
    } catch {
      return String(value);
    }
  }

  /* -------------------------------------------------------
     File loading + source preparation
     ------------------------------------------------------- */

  function isSupportedFile(file) {
    const name = (file.name || "").toLowerCase();
    const extensionOk = /\.(jpe?g|png)$/.test(name);
    const typeOk = /^image\/(jpeg|png)$/i.test(file.type || "");
    return extensionOk || typeOk;
  }

  function fileTypeLabel(file) {
    const name = (file.name || "").toLowerCase();
    if (name.endsWith(".png") || file.type === "image/png") return "PNG";
    return "JPG";
  }

  function formatBytes(bytes) {
    if (!Number.isFinite(bytes) || bytes <= 0) return "—";
    if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(bytes >= 10 * 1024 * 1024 ? 0 : 1)} MB`;
  }

  async function loadFile(file) {
    if (!file) return;

    if (!isSupportedFile(file)) {
      showToast(t("errorUnsupported"), "error");
      return;
    }

    if (file.size > MAX_FILE_BYTES) {
      showToast(t("errorTooLarge"), "error");
      return;
    }

    const token = ++state.loadToken;
    clearTimeout(state.renderTimer);
    state.renderSequence += 1;
    if (state.sampling) cancelSampling({ restoreView: false });

    let committed = false;
    const nextUrl = URL.createObjectURL(file);
    const image = new Image();
    image.decoding = "async";
    image.src = nextUrl;

    setProcessing(true, "processingReading");

    try {
      if (typeof image.decode === "function") {
        await image.decode();
      } else {
        await waitForImageLoad(image);
      }

      if (token !== state.loadToken) {
        URL.revokeObjectURL(nextUrl);
        return;
      }

      if (!image.naturalWidth || !image.naturalHeight) {
        throw createUserError("errorEmptyImage");
      }

      const megapixels = (image.naturalWidth * image.naturalHeight) / 1_000_000;
      if (megapixels > MAX_SOURCE_MEGAPIXELS) {
        throw createUserError("errorTooManyPixels", {
          width: formatNumber(image.naturalWidth),
          height: formatNumber(image.naturalHeight)
        });
      }

      setProcessing(true, "processingGenerating");
      await paintGap();

      if (token !== state.loadToken) {
        URL.revokeObjectURL(nextUrl);
        return;
      }

      const prepared = prepareSource(image);
      if (!prepared) throw createUserError("errorCannotReadPixels");

      if (token !== state.loadToken) {
        URL.revokeObjectURL(nextUrl);
        return;
      }

      const previousUrl = state.sourceUrl;
      committed = true;

      state.img = image;
      state.fileName = file.name || t("untitledImage");
      state.fileSize = file.size || 0;
      state.fileType = fileTypeLabel(file);
      state.sourceUrl = nextUrl;
      state.originalWidth = image.naturalWidth;
      state.originalHeight = image.naturalHeight;
      state.sourceData = prepared.imageData;
      state.sourceVersion += 1;
      state.ready = false;
      state.outputW = 0;
      state.outputH = 0;
      state.alphaCache = null;
      state.alphaCacheKey = "";
      state.lastRenderKey = "";
      state.manualBg = null;
      state.manualSeed = null;
      state.bgInfo = detectBackground(prepared.imageData);
      state.view = "compare";

      if (previousUrl && previousUrl !== nextUrl) {
        URL.revokeObjectURL(previousUrl);
      }

      dom.originalImage.src = nextUrl;
      dom.fileThumb.src = nextUrl;
      dom.fileName.textContent = state.fileName;
      dom.fileDetail.textContent = `${formatNumber(state.originalWidth)} × ${formatNumber(state.originalHeight)} · ${state.fileType} · ${formatBytes(state.fileSize)}`;
      dom.fileThumb.alt = state.fileName;
      dom.dropzoneEmpty.hidden = true;
      dom.fileCard.hidden = false;
      dom.clearButton.hidden = false;
      updateDropzoneAria();
      dom.statSource.textContent = `${formatNumber(state.originalWidth)} × ${formatNumber(state.originalHeight)}`;
      dom.statColors.textContent = "—";
      dom.statAlpha.textContent = "—";

      updateDocumentTitle();

      dom.emptyState.hidden = true;
      dom.stageArea.hidden = false;
      setView(state.view, { silent: true });
      updateDimsUi();
      updateBackgroundUi();
      updateActionState();
      fitStage();
      updateGridUi();
      queueSidebarScrollState();

      generateNow();
      state.ready = true;
      updateActionState();
      updateBackgroundUi();
      setProcessing(false);
      updateGridUi();

      if (window.innerWidth <= 980 && window.scrollY > 90) {
        const behavior = prefersReducedMotion() ? "auto" : "smooth";
        window.setTimeout(() => {
          dom.previewArea.scrollIntoView({ behavior, block: "center" });
        }, 160);
      }
    } catch (error) {
      if (!committed) URL.revokeObjectURL(nextUrl);

      if (token !== state.loadToken) return;

      console.error(error);
      setProcessing(false);

      if (committed && state.sourceData) {
        state.ready = true;
        updateActionState();
        updateBackgroundUi();
      } else {
        updateActionState();
      }

      let friendly;

      if (error && error.name === "SecurityError") {
        friendly = t("errorSecurity");
      } else if (error && error.userFacing) {
        friendly = error.message;
      } else {
        friendly = t("errorCannotReadImage");
      }

      showToast(friendly, "error");

      if (!state.sourceData) {
        dom.emptyState.hidden = false;
        dom.stageArea.hidden = true;
      }
    }
  }

  function createUserError(key, vars) {
    const error = new Error(t(key, vars));
    error.userFacing = true;
    return error;
  }

  function waitForImageLoad(image) {
    return new Promise((resolve, reject) => {
      image.addEventListener("load", resolve, { once: true });
      image.addEventListener(
        "error",
        () => reject(createUserError("errorCannotReadImage")),
        { once: true }
      );
    });
  }

  function prepareSource(image) {
    const naturalWidth = image.naturalWidth;
    const naturalHeight = image.naturalHeight;
    const scale = Math.min(1, MAX_PROCESS_EDGE / Math.max(naturalWidth, naturalHeight));
    const targetWidth = Math.max(1, Math.round(naturalWidth * scale));
    const targetHeight = Math.max(1, Math.round(naturalHeight * scale));

    let source = image;
    let sourceWidth = naturalWidth;
    let sourceHeight = naturalHeight;

    // Step down in halves for cleaner area-averaging on very large photos.
    while (
      sourceWidth > targetWidth * 2 &&
      sourceHeight > targetHeight * 2 &&
      Math.min(sourceWidth, sourceHeight) > 4
    ) {
      const nextWidth = Math.max(targetWidth, Math.round(sourceWidth / 2));
      const nextHeight = Math.max(targetHeight, Math.round(sourceHeight / 2));
      const stepCanvas = document.createElement("canvas");
      stepCanvas.width = nextWidth;
      stepCanvas.height = nextHeight;
      const stepContext = stepCanvas.getContext("2d", { alpha: true });
      stepContext.imageSmoothingEnabled = true;
      stepContext.imageSmoothingQuality = "high";
      stepContext.drawImage(source, 0, 0, nextWidth, nextHeight);
      source = stepCanvas;
      sourceWidth = nextWidth;
      sourceHeight = nextHeight;
    }

    const canvas = document.createElement("canvas");
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const context = canvas.getContext("2d", { alpha: true, willReadFrequently: true });

    if (!context) return null;

    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    context.clearRect(0, 0, targetWidth, targetHeight);
    context.drawImage(source, 0, 0, targetWidth, targetHeight);

    let imageData;
    try {
      imageData = context.getImageData(0, 0, targetWidth, targetHeight);
    } catch (error) {
      error.name = "SecurityError";
      throw error;
    }

    return { canvas, imageData };
  }
  /* -------------------------------------------------------
     Background detection + removal
     ------------------------------------------------------- */

  function detectBackground(imageData) {
    const { data, width, height } = imageData;
    const buckets = new Map();
    let samples = 0;
    let transparentSamples = 0;

    const addPixel = (x, y) => {
      const index = (y * width + x) * 4;
      const alpha = data[index + 3];

      if (alpha < 20) {
        transparentSamples += 1;
        return;
      }

      const r = data[index];
      const g = data[index + 1];
      const b = data[index + 2];
      const key = ((r >> 3) << 10) | ((g >> 3) << 5) | (b >> 3);
      let bucket = buckets.get(key);

      if (!bucket) {
        bucket = { count: 0, r: 0, g: 0, b: 0 };
        buckets.set(key, bucket);
      }

      bucket.count += 1;
      bucket.r += r;
      bucket.g += g;
      bucket.b += b;
      samples += 1;
    };

    const borderDepth = Math.min(2, Math.max(1, Math.floor(Math.min(width, height) / 3)));

    for (let d = 0; d < borderDepth; d += 1) {
      const top = d;
      const bottom = height - 1 - d;

      if (top >= bottom) break;

      for (let x = 0; x < width; x += 1) {
        addPixel(x, top);
        addPixel(x, bottom);
      }

      const left = d;
      const right = width - 1 - d;

      if (left >= right) continue;

      for (let y = 0; y < height; y += 1) {
        addPixel(left, y);
        addPixel(right, y);
      }
    }

    if (!samples && width * height > 0) {
      // Fallback for one-pixel-tall/wide images whose border loop can skip
      // the only row or column.
      for (let y = 0; y < height; y += 1) {
        for (let x = 0; x < width; x += 1) {
          addPixel(x, y);
        }
      }
    }

    if (!samples) {
      return {
        colors: [],
        dominant: null,
        coverage: 0,
        topShare: 0,
        transparentOnly: transparentSamples > 0
      };
    }

    const sorted = Array.from(buckets.values())
      .map((bucket) => ({
        count: bucket.count,
        r: Math.round(bucket.r / bucket.count),
        g: Math.round(bucket.g / bucket.count),
        b: Math.round(bucket.b / bucket.count)
      }))
      .sort((a, b) => b.count - a.count);

    const total = samples;
    const topShare = sorted[0].count / total;
    const colors = [];
    let coverage = 0;

    for (const bucket of sorted) {
      const share = bucket.count / total;

      if (colors.length >= 5) break;
      if (colors.length > 0 && share < 0.012) break;

      colors.push({ r: bucket.r, g: bucket.g, b: bucket.b });
      coverage += share;

      if (coverage >= 0.97) break;
    }

    return {
      colors,
      dominant: colors[0] || null,
      coverage: Math.min(1, coverage),
      topShare,
      transparentOnly: false
    };
  }

  function buildAlphaMap() {
    if (!state.sourceData) return null;

    const cacheKey = [
      state.sourceVersion,
      state.removeBg ? "bg" : "plain",
      state.tolerance,
      state.manualBg ? `${state.manualBg.r},${state.manualBg.g},${state.manualBg.b}` : "auto",
      state.manualSeed ? `${state.manualSeed.x},${state.manualSeed.y}` : "none"
    ].join("|");

    if (state.alphaCache && state.alphaCacheKey === cacheKey) {
      return state.alphaCache;
    }

    const { data, width, height } = state.sourceData;
    const pixelCount = width * height;
    const alphaMap = new Uint8ClampedArray(pixelCount);

    for (let i = 0; i < pixelCount; i += 1) {
      alphaMap[i] = data[i * 4 + 3];
    }

    if (!state.removeBg) {
      state.alphaCache = alphaMap;
      state.alphaCacheKey = cacheKey;
      return alphaMap;
    }

    const refs = state.manualBg
      ? [state.manualBg]
      : state.bgInfo && state.bgInfo.colors
        ? state.bgInfo.colors
        : [];

    if (!refs.length) {
      state.alphaCache = alphaMap;
      state.alphaCacheKey = cacheKey;
      return alphaMap;
    }

    const tolerance = 2 + (state.tolerance / 100) * 68;
    const toleranceSq = tolerance * tolerance;
    const mask = new Uint8Array(pixelCount);
    const queue = new Int32Array(pixelCount);
    let head = 0;
    let tail = 0;

    const isBackgroundColor = (index) => {
      const p = index * 4;
      const r = data[p];
      const g = data[p + 1];
      const b = data[p + 2];
      let best = Infinity;

      for (let i = 0; i < refs.length; i += 1) {
        const ref = refs[i];
        const dr = r - ref.r;
        const dg = g - ref.g;
        const db = b - ref.b;
        const distance = (2 * dr * dr + 4 * dg * dg + 3 * db * db) / 9;
        if (distance < best) best = distance;
        if (best <= toleranceSq) return true;
      }

      return best <= toleranceSq;
    };

    const seed = (index, force = false) => {
      if (index < 0 || index >= pixelCount || mask[index]) return;

      if (force || alphaMap[index] === 0 || isBackgroundColor(index)) {
        mask[index] = 1;
        queue[tail] = index;
        tail += 1;
      }
    };

    // Seed from every edge pixel: only edge-connected regions can be background.
    for (let x = 0; x < width; x += 1) {
      seed(x);
      if (height > 1) seed((height - 1) * width + x);
    }

    for (let y = 1; y < height - 1; y += 1) {
      seed(y * width);
      if (width > 1) seed(y * width + width - 1);
    }

    if (state.manualSeed) {
      const mx = clampInt(state.manualSeed.x, 0, width - 1, 0);
      const my = clampInt(state.manualSeed.y, 0, height - 1, 0);
      seed(my * width + mx, true);
    }

    while (head < tail) {
      const index = queue[head];
      head += 1;
      const x = index % width;
      const y = (index / width) | 0;

      if (x > 0) visit(index - 1);
      if (x < width - 1) visit(index + 1);
      if (y > 0) visit(index - width);
      if (y < height - 1) visit(index + width);
    }

    function visit(index) {
      if (mask[index]) return;

      if (alphaMap[index] === 0) {
        mask[index] = 1;
        queue[tail] = index;
        tail += 1;
        return;
      }

      if (isBackgroundColor(index)) {
        mask[index] = 1;
        queue[tail] = index;
        tail += 1;
      }
    }

    for (let i = 0; i < pixelCount; i += 1) {
      if (mask[i]) alphaMap[i] = 0;
    }

    // Clean up the one-pixel fringe between the cut-out and the background.
    // Edge pixels tinted toward the key color become partially transparent,
    // which stops the key color bleeding into the low-resolution result.
    const featherStart = tolerance * 0.5;
    const featherEnd = tolerance * 1.45;
    const featherRange = featherEnd - featherStart;

    if (featherRange > 0.1) {
      for (let y = 0; y < height; y += 1) {
        const rowOffset = y * width;

        for (let x = 0; x < width; x += 1) {
          const index = rowOffset + x;

          if (mask[index] || alphaMap[index] === 0) continue;

          const touchesCutout =
            (x > 0 && mask[index - 1]) ||
            (x < width - 1 && mask[index + 1]) ||
            (y > 0 && mask[index - width]) ||
            (y < height - 1 && mask[index + width]);

          if (!touchesCutout) continue;

          const p = index * 4;
          const r = data[p];
          const g = data[p + 1];
          const b = data[p + 2];
          let nearestSq = Infinity;

          for (let i = 0; i < refs.length; i += 1) {
            const ref = refs[i];
            const dr = r - ref.r;
            const dg = g - ref.g;
            const db = b - ref.b;
            const distance = (2 * dr * dr + 4 * dg * dg + 3 * db * db) / 9;
            if (distance < nearestSq) nearestSq = distance;
          }

          const distance = Math.sqrt(nearestSq);

          if (distance < featherEnd) {
            const factor = clamp((distance - featherStart) / featherRange, 0, 1);
            const softened = Math.round(alphaMap[index] * factor);
            if (softened < alphaMap[index]) alphaMap[index] = softened;
          }
        }
      }
    }

    state.alphaCache = alphaMap;
    state.alphaCacheKey = cacheKey;
    return alphaMap;
  }

  /* -------------------------------------------------------
     Pixelation
     ------------------------------------------------------- */

  function resizeToPixelArt(alphaMap, outputWidth, outputHeight) {
    const source = state.sourceData;
    const sourceData = source.data;
    const sourceWidth = source.width;
    const sourceHeight = source.height;
    const output = new ImageData(outputWidth, outputHeight);
    const outputData = output.data;

    const xBounds = new Int32Array(outputWidth + 1);
    const yBounds = new Int32Array(outputHeight + 1);

    for (let x = 0; x <= outputWidth; x += 1) {
      xBounds[x] = Math.min(sourceWidth, Math.floor((x * sourceWidth) / outputWidth));
    }

    for (let y = 0; y <= outputHeight; y += 1) {
      yBounds[y] = Math.min(sourceHeight, Math.floor((y * sourceHeight) / outputHeight));
    }

    xBounds[outputWidth] = sourceWidth;
    yBounds[outputHeight] = sourceHeight;

    for (let oy = 0; oy < outputHeight; oy += 1) {
      let y0 = yBounds[oy];
      let y1 = yBounds[oy + 1];

      if (y1 <= y0) {
        y0 = Math.min(y0, sourceHeight - 1);
        y1 = y0 + 1;
      }

      for (let ox = 0; ox < outputWidth; ox += 1) {
        let x0 = xBounds[ox];
        let x1 = xBounds[ox + 1];

        if (x1 <= x0) {
          x0 = Math.min(x0, sourceWidth - 1);
          x1 = x0 + 1;
        }

        // Block boundaries are distributed over the source. If the requested
        // pixel size is larger than the source, the fallback below keeps each
        // output cell populated instead of leaving transparent holes.
        if (x1 <= x0) x1 = x0 + 1;
        if (y1 <= y0) y1 = y0 + 1;

        let sumR = 0;
        let sumG = 0;
        let sumB = 0;
        let sumAlpha = 0;
        let count = 0;

        for (let sy = y0; sy < y1 && sy < sourceHeight; sy += 1) {
          let sourceIndex = sy * sourceWidth + x0;

          for (let sx = x0; sx < x1 && sx < sourceWidth; sx += 1) {
            const alpha = alphaMap[sourceIndex];
            count += 1;

            if (alpha > 0) {
              const weight = alpha / 255;
              const p = sourceIndex * 4;
              sumR += sourceData[p] * weight;
              sumG += sourceData[p + 1] * weight;
              sumB += sourceData[p + 2] * weight;
              sumAlpha += weight;
            }

            sourceIndex += 1;
          }
        }

        const outIndex = (oy * outputWidth + ox) * 4;

        if (sumAlpha > 0 && count > 0) {
          outputData[outIndex] = sumR / sumAlpha;
          outputData[outIndex + 1] = sumG / sumAlpha;
          outputData[outIndex + 2] = sumB / sumAlpha;
          outputData[outIndex + 3] = (sumAlpha / count) * 255;
        } else {
          outputData[outIndex] = 0;
          outputData[outIndex + 1] = 0;
          outputData[outIndex + 2] = 0;
          outputData[outIndex + 3] = 0;
        }
      }
    }

    return output;
  }

  function generateNow() {
    if (!state.sourceData) return;

    const dims = getOutputDimensions();
    if (!dims) return;

    const alphaMap = buildAlphaMap();
    if (!alphaMap) return;

    const output = resizeToPixelArt(alphaMap, dims.width, dims.height);
    const ctx = dom.resultCanvas.getContext("2d");

    dom.resultCanvas.width = dims.width;
    dom.resultCanvas.height = dims.height;
    ctx.clearRect(0, 0, dims.width, dims.height);
    ctx.putImageData(output, 0, 0);

    const colorSet = new Set();
    let transparent = 0;
    const resultData = output.data;
    const totalPixels = dims.width * dims.height;

    for (let i = 0; i < resultData.length; i += 4) {
      if (resultData[i + 3] < 8) {
        transparent += 1;
      } else {
        colorSet.add((resultData[i] << 16) | (resultData[i + 1] << 8) | resultData[i + 2]);
      }
    }

    state.outputW = dims.width;
    state.outputH = dims.height;
    state.resultColors = colorSet.size;
    state.transparentPercent = totalPixels > 0 ? (transparent / totalPixels) * 100 : 0;
    state.lastRenderKey = getRenderKey();

    dom.resultCanvas.setAttribute(
      "aria-label",
      t("resultCanvasAria", {
        width: dims.width,
        height: dims.height,
        colors: formatNumber(state.resultColors)
      })
    );

    dom.statColors.textContent = formatNumber(state.resultColors);
    dom.statAlpha.textContent = formatTransparentPercent(state.transparentPercent);
    dom.resultLabelSize.textContent = `${dims.width} × ${dims.height}`;
    dom.pixelGrid.style.backgroundSize = `${100 / dims.width}% ${100 / dims.height}%`;

    updateDimsUi();
    updateActionState();
    updateGridUi();

    if (!state.ready) {
      state.ready = true;
      updateActionState();
      updateBackgroundUi();
      fitStage();
      setView(state.view, { silent: true });
    }
  }

  function scheduleRender(delay = 45) {
    if (!state.sourceData) {
      updateDimsUi();
      return;
    }

    clearTimeout(state.renderTimer);
    const sequence = ++state.renderSequence;

    state.renderTimer = window.setTimeout(() => {
      if (sequence !== state.renderSequence || !state.sourceData) return;

      try {
        generateNow();
      } catch (error) {
        console.error(error);
        showToast(t("errorGenerate"), "error");
      }
    }, delay);
  }

  function getRenderKey() {
    return [
      state.sourceVersion,
      state.size,
      state.removeBg ? "bg" : "plain",
      state.tolerance,
      state.manualBg ? `${state.manualBg.r},${state.manualBg.g},${state.manualBg.b}` : "auto",
      state.manualSeed ? `${state.manualSeed.x},${state.manualSeed.y}` : "none"
    ].join("|");
  }

  function formatTransparentPercent(percent) {
    if (percent <= 0) return "0%";
    if (percent > 0 && percent < 1) return "<1%";
    return `${Math.round(percent)}%`;
  }

  /* -------------------------------------------------------
     Background UI + eyedropper
     ------------------------------------------------------- */

  function toggleBackgroundRemoval() {
    if (!state.ready) return;

    state.removeBg = !state.removeBg;

    if (!state.removeBg && state.sampling) {
      cancelSampling({ restoreView: false });
    }

    updateBackgroundUi();
    updateDimsUi();
    scheduleRender(20);
    queueSidebarScrollState();

    if (state.removeBg) {
      revealBackgroundOptions();
    }

    if (
      state.removeBg &&
      state.bgInfo &&
      state.bgInfo.colors.length &&
      (state.bgInfo.coverage < 0.7 || state.bgInfo.topShare < 0.25)
    ) {
      showToast(t("infoComplexBackground"), "info");
    }
  }

  function revealBackgroundOptions() {
    if (window.innerWidth <= 980) return;

    window.requestAnimationFrame(() => {
      const scrollerRect = dom.sidebarScroll.getBoundingClientRect();
      const detailsRect = dom.bgDetails.getBoundingClientRect();
      const hiddenBelow = detailsRect.bottom - scrollerRect.bottom;

      if (hiddenBelow > 2) {
        dom.sidebarScroll.scrollTo({
          top: dom.sidebarScroll.scrollHeight,
          behavior: prefersReducedMotion() ? "auto" : "smooth"
        });
      }
    });
  }

  function updateBackgroundUi() {
    const hasImage = Boolean(state.sourceData);
    dom.bgToggle.disabled = !state.ready;
    dom.bgToggle.setAttribute("aria-checked", state.removeBg ? "true" : "false");
    dom.bgDetails.hidden = !(state.ready && state.removeBg);

    dom.resetAutoButton.hidden = !state.manualBg;
    dom.sampleButton.classList.toggle("is-active", state.sampling);
    dom.sampleButtonLabel.textContent = state.sampling
      ? t("cancelPicking")
      : state.manualBg
        ? t("sampleAgain")
        : t("sampleBg");

    if (!hasImage) {
      setSwatch(null);
      dom.bgDetect.textContent = t("detectNoImage");
      dom.bgDetect.removeAttribute("title");
      return;
    }

    if (state.manualBg) {
      const hex = rgbToHex(state.manualBg.r, state.manualBg.g, state.manualBg.b);
      setSwatch(hex);
      dom.bgDetect.textContent = t("detectManual", {
        color: hex,
        tolerance: state.tolerance
      });
      dom.bgDetect.removeAttribute("title");
      return;
    }

    if (state.bgInfo && state.bgInfo.transparentOnly) {
      setSwatch(null);
      dom.bgDetect.textContent = t("detectTransparent");
      dom.bgDetect.removeAttribute("title");
      return;
    }

    if (state.bgInfo && state.bgInfo.dominant) {
      const hex = rgbToHex(state.bgInfo.dominant.r, state.bgInfo.dominant.g, state.bgInfo.dominant.b);
      setSwatch(hex);

      if (state.bgInfo.coverage < 0.65 || state.bgInfo.topShare < 0.25) {
        dom.bgDetect.textContent = t("detectBusy");
        dom.bgDetect.title = t("detectBusyTitle", {
          color: hex,
          coverage: Math.round(state.bgInfo.coverage * 100)
        });
      } else {
        const coverage = Math.round(state.bgInfo.coverage * 100);
        dom.bgDetect.textContent = t("detectAuto", { color: hex, coverage });
        dom.bgDetect.removeAttribute("title");
      }
      return;
    }

    setSwatch(null);
    dom.bgDetect.textContent = t("detectUnknown");
    dom.bgDetect.removeAttribute("title");
  }

  function queueSidebarScrollState() {
    window.requestAnimationFrame(() => {
      updateSidebarScrollState();
    });
  }

  function updateSidebarScrollState() {
    if (!dom.sidebarScroll || !dom.scrollCue) return;

    if (window.innerWidth <= 980) {
      dom.scrollCue.hidden = true;
      dom.sidebar.classList.remove("is-scrolled");
      return;
    }

    const overflow = dom.sidebarScroll.scrollHeight - dom.sidebarScroll.clientHeight;
    const hasOverflow = overflow > 4;
    const atBottom =
      dom.sidebarScroll.scrollTop + dom.sidebarScroll.clientHeight >=
      dom.sidebarScroll.scrollHeight - 8;

    dom.scrollCue.hidden = !hasOverflow || atBottom;
    dom.sidebar.classList.toggle("is-scrolled", hasOverflow && dom.sidebarScroll.scrollTop > 3);
  }

  function setSwatch(hex) {
    if (hex) {
      dom.bgSwatch.style.backgroundImage = "none";
      dom.bgSwatch.style.backgroundColor = hex;
    } else {
      dom.bgSwatch.style.backgroundImage = "";
      dom.bgSwatch.style.backgroundColor = "";
    }
  }

  function resetAutoBackground() {
    if (!state.manualBg) return;
    state.manualBg = null;
    state.manualSeed = null;
    updateBackgroundUi();
    scheduleRender(10);
    showToast(t("successResetAuto"), "success");
  }

  function toggleSampling() {
    if (!state.ready) return;

    if (state.sampling) {
      cancelSampling();
      return;
    }

    if (!state.removeBg) {
      state.removeBg = true;
      updateBackgroundUi();
      scheduleRender(10);
    }

    state.sampling = true;
    state.previousView = state.view;
    setView("original", { silent: true });
    syncSamplingUi();
    updateBackgroundUi();
  }

  function cancelSampling(options = {}) {
    const { restoreView = true } = options;
    if (!state.sampling) return;

    state.sampling = false;
    syncSamplingUi();
    updateBackgroundUi();

    if (restoreView) {
      setView(state.previousView || "compare", { silent: true });
    }
  }

  function syncSamplingUi() {
    dom.stageFrame.classList.toggle("is-sampling", state.sampling);
    dom.samplingBanner.hidden = !state.sampling;
    dom.splitLine.hidden = state.sampling || state.view !== "compare" || !state.ready;
    dom.sampleButton.classList.toggle("is-active", state.sampling);
    dom.sampleButtonLabel.textContent = state.sampling
      ? t("cancelPicking")
      : state.manualBg
        ? t("sampleAgain")
        : t("sampleBg");
    updateStageHint();
  }

  function sampleColorAt(sourceX, sourceY) {
    const { data, width, height } = state.sourceData;
    const centerX = clampInt(sourceX, 0, width - 1, 0);
    const centerY = clampInt(sourceY, 0, height - 1, 0);

    let sumR = 0;
    let sumG = 0;
    let sumB = 0;
    let count = 0;

    for (let y = centerY - 1; y <= centerY + 1; y += 1) {
      if (y < 0 || y >= height) continue;

      for (let x = centerX - 1; x <= centerX + 1; x += 1) {
        if (x < 0 || x >= width) continue;

        const p = (y * width + x) * 4;
        if (data[p + 3] < 20) continue;

        sumR += data[p];
        sumG += data[p + 1];
        sumB += data[p + 2];
        count += 1;
      }
    }

    if (!count) return null;

    return {
      r: Math.round(sumR / count),
      g: Math.round(sumG / count),
      b: Math.round(sumB / count)
    };
  }

  function handleStageClick(event) {
    if (!state.sampling) return;
    if (event.target.closest(".sampling-banner")) return;

    event.preventDefault();
    event.stopPropagation();

    const rect = dom.stageFrame.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    const relativeX = clamp((event.clientX - rect.left) / rect.width, 0, 0.999999);
    const relativeY = clamp((event.clientY - rect.top) / rect.height, 0, 0.999999);
    const sourceX = Math.floor(relativeX * state.sourceData.width);
    const sourceY = Math.floor(relativeY * state.sourceData.height);
    const color = sampleColorAt(sourceX, sourceY);

    if (!color) {
      showToast(t("errorTransparentSample"), "info");
      return;
    }

    state.manualBg = color;
    state.manualSeed = { x: sourceX, y: sourceY };
    state.sampling = false;
    syncSamplingUi();
    updateBackgroundUi();
    setView("compare", { silent: true });
    scheduleRender(10);

    showToast(t("successSampled", { color: rgbToHex(color.r, color.g, color.b) }), "success");
  }

  /* -------------------------------------------------------
     Preview views + comparison slider
     ------------------------------------------------------- */

  function setView(view, options = {}) {
    if (!["compare", "result", "original"].includes(view)) return;

    const { silent = false } = options;
    state.view = view;
    dom.stageFrame.dataset.view = view;

    for (const tab of dom.viewTabs) {
      const active = tab.dataset.view === view;
      tab.classList.toggle("is-active", active);
      tab.setAttribute("aria-selected", active ? "true" : "false");
      tab.tabIndex = active ? 0 : -1;
    }

    dom.splitLine.hidden = !(state.ready && view === "compare" && !state.sampling);
    updateGridUi();
    updateStageHint();

    if (!silent) {
      syncSamplingUi();
    }
  }

  function updateStageHint() {
    const hintKey =
      state.view === "result"
        ? "stageHintResult"
        : state.view === "original"
          ? "stageHintOriginal"
          : "stageHintCompare";

    dom.stageHint.textContent = t(hintKey);

    if (!state.ready || state.sampling) {
      dom.stageHint.hidden = true;
      return;
    }

    const frameHeight = dom.stageFrame.getBoundingClientRect().height;
    dom.stageHint.hidden = frameHeight > 0 && frameHeight < 108;
  }

  function updateGridUi() {
    const visible =
      state.ready &&
      state.gridOn &&
      state.view !== "original" &&
      !state.sampling &&
      dom.stageArea.hidden === false;

    dom.gridButton.disabled = !state.ready;
    dom.gridButton.setAttribute("aria-pressed", state.gridOn ? "true" : "false");
    dom.pixelGrid.hidden = !visible;
  }

  function updateSplitUi(percent) {
    const clamped = clamp(percent, 2, 98);
    state.split = clamped;
    dom.stageFrame.style.setProperty("--split", `${clamped}%`);
    dom.splitHandle.setAttribute("aria-valuenow", String(Math.round(clamped)));
    dom.splitHandle.setAttribute(
      "aria-valuetext",
      t("splitValueText", {
        left: Math.round(clamped),
        right: Math.round(100 - clamped)
      })
    );
  }

  function updateSplitFromPointer(event) {
    const rect = dom.stageFrame.getBoundingClientRect();
    if (!rect.width) return;
    const percent = ((event.clientX - rect.left) / rect.width) * 100;
    updateSplitUi(percent);
  }

  function handleStagePointerDown(event) {
    if (!state.ready || state.sampling || state.view !== "compare") return;
    if (event.button !== undefined && event.button !== 0) return;

    event.preventDefault();
    state.dragging = true;
    state.splitPointerId = event.pointerId;
    dom.stageFrame.classList.add("is-dragging");

    try {
      dom.stageFrame.setPointerCapture(event.pointerId);
    } catch {
      /* Pointer capture can fail on older browsers; dragging still works. */
    }

    updateSplitFromPointer(event);
  }

  function handleStagePointerMove(event) {
    if (!state.dragging || event.pointerId !== state.splitPointerId) return;
    event.preventDefault();
    updateSplitFromPointer(event);
  }

  function endStageDrag(event) {
    if (!state.dragging) return;
    if (event.pointerId !== undefined && event.pointerId !== state.splitPointerId) return;

    state.dragging = false;
    dom.stageFrame.classList.remove("is-dragging");

    try {
      dom.stageFrame.releasePointerCapture(state.splitPointerId);
    } catch {
      /* Ignore. */
    }

    state.splitPointerId = null;
  }

  function handleSplitKeydown(event) {
    if (state.view !== "compare" || !state.ready) return;

    const step = event.shiftKey ? 10 : 2;
    let next = state.split;

    if (event.key === "ArrowLeft" || event.key === "ArrowDown") next -= step;
    else if (event.key === "ArrowRight" || event.key === "ArrowUp") next += step;
    else if (event.key === "Home") next = 2;
    else if (event.key === "End") next = 98;
    else return;

    event.preventDefault();
    updateSplitUi(next);
  }

  function handleTabKeydown(event) {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;

    const enabled = dom.viewTabs.filter((tab) => !tab.disabled);
    if (!enabled.length) return;

    const current = enabled.indexOf(document.activeElement);
    let next = current;

    if (event.key === "ArrowLeft") next = current <= 0 ? enabled.length - 1 : current - 1;
    if (event.key === "ArrowRight") next = current >= enabled.length - 1 ? 0 : current + 1;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = enabled.length - 1;

    event.preventDefault();
    const target = enabled[next];
    if (target) {
      setView(target.dataset.view);
      target.focus();
    }
  }

  /* -------------------------------------------------------
     Layout fitting
     ------------------------------------------------------- */

  function scheduleFit() {
    if (state.fitFrame) return;

    state.fitFrame = window.requestAnimationFrame(() => {
      state.fitFrame = 0;
      fitStage();
    });
  }

  function fitStage() {
    if (!state.sourceData || dom.stageArea.hidden) return;

    const availableWidth = dom.stageArea.clientWidth;
    const availableHeight = dom.stageArea.clientHeight;

    if (!availableWidth || !availableHeight) return;

    const aspect = state.originalWidth / state.originalHeight;
    let width = availableWidth;
    let height = width / aspect;

    if (height > availableHeight) {
      height = availableHeight;
      width = height * aspect;
    }

    // Keep the stage on whole-ish pixels for the crispest checkerboard edges.
    dom.stageFrame.style.width = `${Math.max(1, Math.floor(width))}px`;
    dom.stageFrame.style.height = `${Math.max(1, Math.floor(height))}px`;

    updateStageHint();
  }

  /* -------------------------------------------------------
     Export
     ------------------------------------------------------- */

  async function downloadPng() {
    if (!state.sourceData || state.busy) return;

    clearTimeout(state.renderTimer);

    try {
      if (state.lastRenderKey !== getRenderKey() || !state.outputW) {
        generateNow();
      }

      const scale = state.scale;
      const outputWidth = state.outputW * scale;
      const outputHeight = state.outputH * scale;

      const exportCanvas = document.createElement("canvas");
      exportCanvas.width = outputWidth;
      exportCanvas.height = outputHeight;

      const context = exportCanvas.getContext("2d");
      context.imageSmoothingEnabled = false;
      context.clearRect(0, 0, outputWidth, outputHeight);
      context.drawImage(dom.resultCanvas, 0, 0, outputWidth, outputHeight);

      const blob = await new Promise((resolve, reject) => {
        exportCanvas.toBlob((result) => {
          if (result) resolve(result);
          else reject(new Error(t("errorCreatePng")));
        }, "image/png");
      });

      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = buildDownloadName(outputWidth, outputHeight);
      document.body.appendChild(link);
      link.click();
      link.remove();

      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1500);
      showToast(
        t("successExported", { width: outputWidth, height: outputHeight }),
        "success"
      );
    } catch (error) {
      console.error(error);
      showToast(t("errorDownload"), "error");
    }
  }

  function buildDownloadName(width, height) {
    const fallbackName = t("downloadFallbackName");
    const base = (state.fileName || fallbackName)
      .replace(/\.[^.]+$/, "")
      .replace(/[\\/:*?"<>|]/g, "_")
      .trim()
      .slice(0, 64) || fallbackName;

    const scaleSuffix = state.scale > 1 ? `@${state.scale}x` : "";
    return `${base}_pixel-${width}x${height}${scaleSuffix}.png`;
  }

  /* -------------------------------------------------------
     Clear / reset
     ------------------------------------------------------- */

  function clearImage() {
    if (!state.sourceData) return;

    state.loadToken += 1;
    state.renderSequence += 1;
    clearTimeout(state.renderTimer);
    if (state.sampling) cancelSampling({ restoreView: false });
    setProcessing(false);

    if (state.sourceUrl) URL.revokeObjectURL(state.sourceUrl);

    state.img = null;
    state.fileName = "";
    state.fileSize = 0;
    state.fileType = "";
    state.sourceUrl = "";
    state.originalWidth = 0;
    state.originalHeight = 0;
    state.sourceData = null;
    state.sourceVersion = 0;
    state.ready = false;
    state.busy = false;
    state.bgInfo = null;
    state.manualBg = null;
    state.manualSeed = null;
    state.alphaCache = null;
    state.alphaCacheKey = "";
    state.outputW = 0;
    state.outputH = 0;
    state.resultColors = 0;
    state.transparentPercent = 0;
    state.lastRenderKey = "";
    state.sampling = false;

    dom.fileInput.value = "";
    dom.originalImage.removeAttribute("src");
    dom.fileThumb.removeAttribute("src");
    dom.fileThumb.alt = "";
    dom.fileCard.hidden = true;
    dom.dropzoneEmpty.hidden = false;
    dom.clearButton.hidden = true;
    updateDropzoneAria();

    dom.stageArea.hidden = true;
    dom.emptyState.hidden = false;
    dom.processingOverlay.hidden = true;
    dom.samplingBanner.hidden = true;
    dom.stageFrame.classList.remove("is-sampling", "is-dragging");
    dom.resultCanvas.width = 1;
    dom.resultCanvas.height = 1;
    dom.statSource.textContent = t("waitingImport");
    dom.statOutput.textContent = "—";
    dom.statColors.textContent = "—";
    dom.statAlpha.textContent = "—";
    dom.pixelGrid.hidden = true;
    dom.bgDetails.hidden = true;

    updateDocumentTitle();

    updateBackgroundUi();
    updateDimsUi();
    updateActionState();
    updateGridUi();
    setView("compare", { silent: true });
    updateStageHint();
    updateResultCanvasAria();
    queueSidebarScrollState();

    dom.dropzone.focus({ preventScroll: true });
    showToast(t("successCleared"), "info");
  }

  /* -------------------------------------------------------
     Global UI state
     ------------------------------------------------------- */

  function updateActionState() {
    const hasImage = Boolean(state.sourceData);
    const interactive = hasImage && state.ready;

    dom.clearButton.hidden = !hasImage;
    dom.bgToggle.disabled = !interactive;

    for (const tab of dom.viewTabs) {
      tab.disabled = !interactive;
    }

    dom.gridButton.disabled = !interactive;
    dom.downloadButton.disabled = !interactive || state.busy || !state.outputW;
    dom.downloadButton.setAttribute("aria-busy", state.busy ? "true" : "false");
  }

  function setProcessing(visible, messageKey) {
    state.busy = Boolean(visible);
    dom.processingOverlay.hidden = !visible;

    if (messageKey) state.processingKey = messageKey;
    updateProcessingText();

    dom.downloadButton.disabled = !state.ready || state.busy || !state.outputW;
    dom.downloadButton.setAttribute("aria-busy", state.busy ? "true" : "false");
  }

  /* -------------------------------------------------------
     Drag + drop / paste
     ------------------------------------------------------- */

  let dragDepth = 0;

  function dataTransferHasFiles(event) {
    const transfer = event.dataTransfer;
    if (!transfer) return false;

    if (transfer.types) {
      return Array.from(transfer.types).includes("Files");
    }

    return transfer.files && transfer.files.length > 0;
  }

  function handleDragEnter(event) {
    if (!dataTransferHasFiles(event)) return;
    event.preventDefault();
    dragDepth += 1;
    showDropOverlay();
  }

  function handleDragOver(event) {
    if (!dataTransferHasFiles(event)) return;
    event.preventDefault();

    try {
      event.dataTransfer.dropEffect = "copy";
    } catch {
      /* Ignore. */
    }
  }

  function handleDragLeave() {
    if (dom.dropOverlay.hidden) return;
    dragDepth = Math.max(0, dragDepth - 1);

    if (dragDepth === 0) hideDropOverlay();
  }

  function handleDrop(event) {
    if (!event.dataTransfer) return;
    event.preventDefault();
    dragDepth = 0;
    hideDropOverlay();

    const files = Array.from(event.dataTransfer.files || []);
    if (!files.length) return;

    if (files.length > 1) {
      showToast(t("multipleFiles"), "info");
    }

    loadFile(files[0]);
  }

  function showDropOverlay() {
    if (dom.dropOverlay.hidden) {
      dom.dropOverlay.hidden = false;
      dom.dropOverlay.setAttribute("aria-hidden", "false");
    }
  }

  function hideDropOverlay() {
    dragDepth = 0;
    if (!dom.dropOverlay.hidden) {
      dom.dropOverlay.hidden = true;
      dom.dropOverlay.setAttribute("aria-hidden", "true");
    }
  }

  function handlePaste(event) {
    const target = event.target;
    if (
      target &&
      (target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable)
    ) {
      return;
    }

    const items = event.clipboardData ? Array.from(event.clipboardData.items || []) : [];
    const imageItem = items.find((item) => item.kind === "file" && item.type.startsWith("image/"));

    if (!imageItem) return;

    const blob = imageItem.getAsFile();
    if (!blob) return;

    event.preventDefault();

    if (!/^image\/(jpeg|png)$/i.test(blob.type)) {
      showToast(t("errorClipboardType"), "error");
      return;
    }

    const extension = blob.type === "image/png" ? "png" : "jpg";
    const stamp = new Date();
    const time = `${String(stamp.getHours()).padStart(2, "0")}${String(stamp.getMinutes()).padStart(2, "0")}${String(stamp.getSeconds()).padStart(2, "0")}`;
    const file = new File([blob], `${t("pasteFileName", { time })}.${extension}`, {
      type: blob.type
    });

    loadFile(file);
  }

  /* -------------------------------------------------------
     Help / dialog / keyboard helpers
     ------------------------------------------------------- */

  function handleGlobalKeydown(event) {
    if (event.key === "Escape" && state.sampling) {
      event.preventDefault();
      cancelSampling();
      return;
    }

    if (
      (event.ctrlKey || event.metaKey) &&
      !event.altKey &&
      !event.shiftKey &&
      event.key.toLowerCase() === "s" &&
      state.ready
    ) {
      event.preventDefault();
      downloadPng();
    }
  }
  function prefersReducedMotion() {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  /* -------------------------------------------------------
     Toasts
     ------------------------------------------------------- */

  function showToast(message, type = "info") {
    const toast = document.createElement("div");
    toast.className = `toast ${type === "error" ? "is-error" : type === "success" ? "is-success" : "is-info"}`;

    const mark = document.createElement("span");
    mark.className = "toast-mark";
    mark.setAttribute("aria-hidden", "true");
    mark.textContent = type === "error" ? "!" : type === "success" ? "✓" : "i";

    const copy = document.createElement("span");
    copy.textContent = message;

    toast.append(mark, copy);

    while (dom.toastStack.children.length >= 3) {
      dom.toastStack.firstElementChild.remove();
    }

    dom.toastStack.appendChild(toast);

    window.setTimeout(() => {
      toast.classList.add("is-leaving");
      window.setTimeout(() => toast.remove(), 200);
    }, type === "error" ? 5000 : 3200);
  }

  /* -------------------------------------------------------
     Utilities
     ------------------------------------------------------- */

  function rgbToHex(r, g, b) {
    const toHex = (value) => clampInt(value, 0, 255, 0).toString(16).padStart(2, "0").toUpperCase();
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function clampInt(value, min, max, fallback) {
    const number = Number(value);
    if (!Number.isFinite(number)) return fallback;
    return Math.round(Math.min(max, Math.max(min, number)));
  }

  function paintGap() {
    return new Promise((resolve) => {
      window.requestAnimationFrame(() => window.setTimeout(resolve, 12));
    });
  }
})();
