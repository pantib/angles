/**
 * CONTROLADOR PRINCIPAL DE L'APLICACIÓ (L'Angleòmetre)
 * Implementa els modes d'aprenentatge, bastides DUA, la sèrie oficial de 20 reptes
 * amb avaluació i qualificació curricular (AE, AN, AS, NA), i accessibilitat WCAG 2.1 AA.
 */

document.addEventListener('DOMContentLoaded', () => {
  // ==========================================
  // ESTAT DE L'APLICACIÓ
  // ==========================================
  const state = {
    currentMode: 'explore', // 'explore' | 'challenge-measure' | 'challenge-build'
    tolerance: 2, // Marges d'error acceptats (±2º estàndard primària)
    speechEnabled: false,
    fontSizeLevel: 0, // 0: normal, 1: gran, 2: molt gran

    // Sèrie oficial de 20 reptes curriculars contextualitzats
    measureSeries: {
      currentIndex: 0,
      totalChallenges: 20,
      isFinished: false,
      history: [] // Emmagatzema les mètriques i resultats de cada repte (1 a 20)
    },

    // Estat del repte actiu de construcció
    buildChallenge: {
      targetAngle: 60,
      attempts: 0
    },

    // Pool oficial de 20 reptes dissenyats amb variació d'orientacions, tipologies i situacions quotidianes
    challengesPool: [
      {
        id: 1,
        angle: 35,
        base: 0,
        name: 'Rampa de monopatí bàsica',
        desc: 'Mesura la inclinació suau d\'aquesta rampa per a patinadors principiants.',
        icon: '🛹'
      },
      {
        id: 2,
        angle: 90,
        base: 0,
        name: 'Cantonada d\'una porteria',
        desc: 'Comprova si el pal i el travesser formen un angle recte perfecte de 90 graus.',
        icon: '⚽'
      },
      {
        id: 3,
        angle: 120,
        base: 0,
        name: 'Teulada d\'una cabana de muntanya',
        desc: 'Mesura l\'obertura d\'aquesta teulada per calcular com relliscarà la pluja.',
        icon: '🏠'
      },
      {
        id: 4,
        angle: 25,
        base: 10,
        name: 'Tisores escolars obertes',
        desc: 'Mesura l\'angle entre les fulles de les tisores (fixa\'t que la base està lleugerament inclinada!).',
        icon: '✂️'
      },
      {
        id: 5,
        angle: 120,
        base: 30,
        name: 'Agulles del rellotge a les 4:00',
        desc: 'Mesura l\'obertura que separen les agulles de les hores i els minuts.',
        icon: '🕒'
      },
      {
        id: 6,
        angle: 70,
        base: 0,
        name: 'Escala de bombers recolzada',
        desc: 'Mesura l\'angle de recolzament de seguretat de l\'escala respecte a terra.',
        icon: '🪜'
      },
      {
        id: 7,
        angle: 45,
        base: 20,
        name: 'Porció de pizza tallada',
        desc: 'Mesura quina fracció de cercle representa aquest tall de pizza.',
        icon: '🍕'
      },
      {
        id: 8,
        angle: 135,
        base: 15,
        name: 'Bifurcació d\'un carril bici',
        desc: 'Mesura l\'obertura de separació d\'aquesta cruïlla de trànsit.',
        icon: '🛣️'
      },
      {
        id: 9,
        angle: 60,
        base: 0,
        name: 'Senyal triangular de trànsit',
        desc: 'Mesura l\'angle interior del vèrtex superior d\'aquest senyal de perill.',
        icon: '⚠️'
      },
      {
        id: 10,
        angle: 30,
        base: 0,
        name: 'Cartabó de dibuix tècnic',
        desc: 'Mesura el vèrtex més punxegut i estret d\'un cartabó d\'escola.',
        icon: '📐'
      },
      {
        id: 11,
        angle: 110,
        base: 0,
        name: 'Pantalla d\'ordinador portàtil',
        desc: 'Mesura l\'obertura ergonòmica de la pantalla oberta sobre la taula.',
        icon: '💻'
      },
      {
        id: 12,
        angle: 50,
        base: 25,
        name: 'Vela triangular d\'un veler',
        desc: 'Mesura l\'angle que forma la vela gran amb la coberta de l\'embarcació.',
        icon: '⛵'
      },
      {
        id: 13,
        angle: 140,
        base: 0,
        name: 'Respatller d\'una gandula',
        desc: 'Mesura la inclinació del respatller per a una posició de descans còmode.',
        icon: '🏖️'
      },
      {
        id: 14,
        angle: 80,
        base: 10,
        name: 'Porta d\'habitació entreoberta',
        desc: 'Mesura l\'angle d\'obertura de la porta abans que quedi en posició perpendicular.',
        icon: '🚪'
      },
      {
        id: 15,
        angle: 65,
        base: 0,
        name: 'Arc de tir amb fletxa',
        desc: 'Mesura la tensió que forma la corda de l\'arc abans del llançament.',
        icon: '🏹'
      },
      {
        id: 16,
        angle: 40,
        base: 15,
        name: 'Bec obert d\'un pelicà',
        desc: 'Mesura l\'angle del bec de l\'ocell marí en capturar un peix a l\'aigua.',
        icon: '🐦'
      },
      {
        id: 17,
        angle: 100,
        base: 0,
        name: 'Finestra abatible d\'una aula',
        desc: 'Mesura com s\'obre la finestra cap a l\'exterior per ventilar la classe.',
        icon: '🪟'
      },
      {
        id: 18,
        angle: 160,
        base: 0,
        name: 'Llibre obert sobre la taula',
        desc: 'Mesura l\'angle gairebé pla que formen les dues tapes del llibre obert de bat a bat.',
        icon: '📚'
      },
      {
        id: 19,
        angle: 55,
        base: 20,
        name: 'Quadre d\'una bicicleta',
        desc: 'Mesura l\'angle d\'unió entre el tub diagonal i la barra del selló del quadre.',
        icon: '🚲'
      },
      {
        id: 20,
        angle: 150,
        base: 10,
        name: 'Braç d\'una grua de construcció',
        desc: 'Mesura l\'angle d\'elevació del braç mecànic per alçar materials pesants.',
        icon: '🏗️'
      }
    ]
  };

  // ==========================================
  // ELEMENTS DEL DOM
  // ==========================================
  const svgEl = document.getElementById('geometry-canvas');
  const srAnnounceEl = document.getElementById('sr-announcements');

  // Pestanyes de Mode
  const tabExplore = document.getElementById('tab-explore');
  const tabChallengeMeasure = document.getElementById('tab-challenge-measure');
  const tabChallengeBuild = document.getElementById('tab-challenge-build');

  // Panells de contingut
  const explorePanel = document.getElementById('explore-panel');
  const challengeMeasurePanel = document.getElementById('challenge-measure-panel');
  const challengeBuildPanel = document.getElementById('challenge-build-panel');

  // Elements de la sèrie de 20 reptes
  const challengeActiveContainer = document.getElementById('challenge-active-container');
  const challengeCurrentNum = document.getElementById('challenge-current-num');
  const challengeCurrentScore = document.getElementById('challenge-current-score');
  const challengeProgressFill = document.getElementById('challenge-progress-fill');
  const challengeStepsTrack = document.getElementById('challenge-steps-track');
  const challengeTitleEl = document.getElementById('challenge-title');
  const challengeDescEl = document.getElementById('challenge-desc');
  const answerInput = document.getElementById('answer-angle');
  const btnCheckAnswer = document.getElementById('btn-check-answer');
  const btnNextChallenge = document.getElementById('btn-next-challenge');
  const btnRevealSolution = document.getElementById('btn-reveal-solution');
  const feedbackBox = document.getElementById('feedback-box');
  const feedbackTitle = document.getElementById('feedback-title');
  const feedbackBody = document.getElementById('feedback-body');
  const feedbackDetail = document.getElementById('feedback-detail');

  // Elements del registre de l'alumne/a
  const inputStudentName = document.getElementById('input-student-name');
  const inputStudentGroup = document.getElementById('input-student-group');
  const inputStudentDate = document.getElementById('input-student-date');
  const summaryStudentName = document.getElementById('summary-student-name');
  const summaryStudentGroup = document.getElementById('summary-student-group');
  const summarySessionDate = document.getElementById('summary-session-date');
  const recordTableBody = document.getElementById('record-table-body');
  const btnExportCsv = document.getElementById('btn-export-csv');

  // Inicialització de la data de la sessió
  if (inputStudentDate) {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    inputStudentDate.value = `${day}/${month}/${year}`;
  }

  // Elements de la Targeta Final d'Avaluació
  const challengeResultsCard = document.getElementById('challenge-results-card');
  const resultsFinalGrade = document.getElementById('results-final-grade');
  const resultsLevelBadge = document.getElementById('results-level-badge');
  const resultsStatFirst = document.getElementById('results-stat-first');
  const resultsStatRetry = document.getElementById('results-stat-retry');
  const resultsStatScaleErrors = document.getElementById('results-stat-scale-errors');
  const resultsStatAccuracy = document.getElementById('results-stat-accuracy');
  const resultsFeedbackBox = document.getElementById('results-feedback-box');
  const btnPrintReport = document.getElementById('btn-print-report');
  const btnRestartChallenges = document.getElementById('btn-restart-challenges');

  // Controls de repte de construcció
  const buildTargetText = document.getElementById('build-target-text');
  const buildCurrentVal = document.getElementById('build-current-val');
  const btnCheckBuild = document.getElementById('btn-check-build');
  const btnNextBuild = document.getElementById('btn-next-build');
  const buildFeedbackBox = document.getElementById('build-feedback-box');
  const buildFeedbackTitle = document.getElementById('build-feedback-title');
  const buildFeedbackBody = document.getElementById('build-feedback-body');

  // Estadístiques mode exploració
  const exploreAngleVal = document.getElementById('explore-angle-val');
  const exploreTypeBadge = document.getElementById('explore-type-badge');
  const exploreTypeDesc = document.getElementById('explore-type-desc');
  const exploreRealAnalogy = document.getElementById('explore-real-analogy');

  // Bastides DUA
  const chk90Guide = document.getElementById('chk-90-guide');
  const chkScaleGuide = document.getElementById('chk-scale-guide');
  const btnHintTrigger = document.getElementById('btn-hint-trigger');
  const hintContent = document.getElementById('hint-content');
  const hintText = document.getElementById('hint-text');

  // Botons d'accessibilitat i barra superior
  const btnHighContrast = document.getElementById('btn-high-contrast');
  const btnFontSize = document.getElementById('btn-font-size');
  const btnSoundToggle = document.getElementById('btn-sound-toggle');
  const btnSpeechToggle = document.getElementById('btn-speech-toggle');
  const selectTolerance = document.getElementById('select-tolerance');

  // Botons de navegació del transportador (teclat / motricitat)
  const btnAlignVertex = document.getElementById('btn-align-vertex');
  const btnAlignBase = document.getElementById('btn-align-base');
  const btnResetProtractor = document.getElementById('btn-reset-protractor');
  const btnMoveUp = document.getElementById('btn-move-up');
  const btnMoveDown = document.getElementById('btn-move-down');
  const btnMoveLeft = document.getElementById('btn-move-left');
  const btnMoveRight = document.getElementById('btn-move-right');
  const btnRotateClockwise = document.getElementById('btn-rotate-cw');
  const btnRotateCounterClockwise = document.getElementById('btn-rotate-ccw');
  const btnRotateCw5 = document.getElementById('btn-rotate-cw5');
  const btnRotateCcw5 = document.getElementById('btn-rotate-ccw5');

  // Modals
  const modalPedagogy = document.getElementById('modal-pedagogy');
  const btnOpenPedagogy = document.getElementById('btn-open-pedagogy');
  const btnClosePedagogy = document.getElementById('btn-close-pedagogy');

  // ==========================================
  // INICIALITZACIÓ DEL TRANSPORTADOR (SVG)
  // ==========================================
  const protractor = new ProtractorView(svgEl, {
    x: 380,
    y: 320,
    rotation: 0,
    radius: 175,
    onAngleChange: (newAngle) => {
      if (state.currentMode === 'explore') {
        updateExploreStats(newAngle);
      } else if (state.currentMode === 'challenge-build') {
        buildCurrentVal.textContent = `${Math.round(newAngle)}º`;
      }
    }
  });

  // ==========================================
  // SUPORT D'ACCESSIBILITAT I LECTOR DE PANTALLA
  // ==========================================
  function announce(message) {
    if (srAnnounceEl) {
      srAnnounceEl.textContent = '';
      setTimeout(() => {
        srAnnounceEl.textContent = message;
      }, 50);
    }
    if (state.speechEnabled && ('speechSynthesis' in window)) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.lang = 'ca-ES';
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  }

  // ==========================================
  // GESTIÓ DELS MODES DE TREBALL
  // ==========================================
  function switchMode(newMode) {
    state.currentMode = newMode;
    window.soundController.playClick();

    // Actualitzar atributs de les pestanyes (ARIA)
    tabExplore.setAttribute('aria-selected', newMode === 'explore');
    tabChallengeMeasure.setAttribute('aria-selected', newMode === 'challenge-measure');
    tabChallengeBuild.setAttribute('aria-selected', newMode === 'challenge-build');

    // Visibilitat dels panells
    explorePanel.style.display = newMode === 'explore' ? 'block' : 'none';
    challengeMeasurePanel.style.display = newMode === 'challenge-measure' ? 'block' : 'none';
    challengeBuildPanel.style.display = newMode === 'challenge-build' ? 'block' : 'none';

    // Ocultar retroaccions anteriors
    feedbackBox.className = 'feedback-box';
    buildFeedbackBox.className = 'feedback-box';
    hintContent.style.display = 'none';

    if (newMode === 'explore') {
      protractor.isAngleDraggable = true;
      protractor.setAngle(55, 0);
      protractor.alignToVertex();
      updateExploreStats(55);
      announce("Mode exploració lliure activat. Pots arrossegar el braç de l'angle per canviar la seva obertura.");
    } else if (newMode === 'challenge-measure') {
      protractor.isAngleDraggable = false;
      if (state.measureSeries.history.length === 0) {
        initMeasureSeries();
      } else if (!state.measureSeries.isFinished) {
        loadMeasureChallenge(state.measureSeries.currentIndex);
      }
    } else if (newMode === 'challenge-build') {
      protractor.isAngleDraggable = true;
      loadNewBuildChallenge();
    }

    protractor.render();
  }

  // ==========================================
  // MODE 1: EXPLORACIÓ LLIURE
  // ==========================================
  function updateExploreStats(angleDeg) {
    const rounded = Math.round(angleDeg);
    exploreAngleVal.textContent = `${rounded}º`;

    const info = GeometryEngine.classifyAngle(angleDeg);
    exploreTypeBadge.textContent = info.name;
    exploreTypeBadge.className = `angle-badge badge-${info.type}`;
    exploreTypeDesc.textContent = info.desc;

    let analogy = '';
    if (info.type === 'agut') {
      analogy = 'Com una llesca de pizza, el bec d\'un ocell o les teulades punxegudes de muntanya.';
    } else if (info.type === 'recte') {
      analogy = 'Com el cantell d\'un llibre, la cantonada d\'una pantalla o l\'escaire de classe.';
    } else if (info.type === 'obtus') {
      analogy = 'Com una cadira de platja reclinada, un portàtil ben obert o un ventall desplegat.';
    } else if (info.type === 'pla') {
      analogy = 'Com l\'horitzó del mar o una corda ben tibada.';
    } else if (info.type === 'reflex') {
      analogy = 'Com l\'obertura gran exterior del Pac-Man quan obre la boca.';
    }
    exploreRealAnalogy.textContent = analogy;
  }

  // ==========================================
  // MODE 2: SÈRIE OFICIAL DE 20 REPTES I AVALUACIÓ
  // ==========================================

  function initMeasureSeries() {
    state.measureSeries.currentIndex = 0;
    state.measureSeries.isFinished = false;
    state.measureSeries.history = state.challengesPool.map((ch, idx) => ({
      index: idx,
      id: ch.id,
      name: ch.name,
      targetAngle: ch.angle,
      baseAngle: ch.base,
      attempts: 0,
      hintsUsed: 0,
      studentAnswer: null,
      scoreEarned: 0, // Màxim 0.5 punts per repte (total 10.0 punts)
      status: 'pending', // 'pending' | 'success-first' | 'success-retry' | 'assisted'
      dualScaleError: false
    }));

    challengeActiveContainer.style.display = 'block';
    challengeResultsCard.style.display = 'none';

    renderStepsTrack();
    loadMeasureChallenge(0);
  }

  function renderStepsTrack() {
    challengeStepsTrack.innerHTML = '';
    state.measureSeries.history.forEach((item, idx) => {
      const step = document.createElement('div');
      step.className = `step-indicator ${item.status}`;
      if (idx === state.measureSeries.currentIndex && !state.measureSeries.isFinished) {
        step.classList.add('current');
      }
      step.textContent = idx + 1;
      step.title = `Repte ${idx + 1}: ${item.name} (${item.status})`;
      challengeStepsTrack.appendChild(step);
    });

    // Actualitzar comptadors i barra de progrés
    const curNum = state.measureSeries.currentIndex + 1;
    challengeCurrentNum.textContent = curNum <= 20 ? curNum : 20;

    const currentScore = calculateCurrentScore();
    challengeCurrentScore.textContent = currentScore.toFixed(1);

    const progressPct = ((curNum) / state.measureSeries.totalChallenges) * 100;
    challengeProgressFill.style.width = `${Math.min(100, Math.max(5, progressPct))}%`;
  }

  function calculateCurrentScore() {
    return state.measureSeries.history.reduce((sum, h) => sum + h.scoreEarned, 0);
  }

  function loadMeasureChallenge(idx) {
    state.measureSeries.currentIndex = idx;
    const item = state.challengesPool[idx];
    const record = state.measureSeries.history[idx];

    challengeTitleEl.innerHTML = `${item.icon} ${item.name}`;
    challengeDescEl.textContent = item.desc;

    // Configurar l'angle a l'SVG
    protractor.setAngle(item.angle, item.base);

    // Posició inicial desalineada del transportador perquè l'alumnat practiqui l'alineació
    protractor.x = 220;
    protractor.y = 190;
    protractor.rotation = 0;
    protractor.render();

    // Reiniciar inputs i retroaccions
    answerInput.value = '';
    answerInput.focus();
    feedbackBox.className = 'feedback-box';
    btnNextChallenge.style.display = 'none';
    btnRevealSolution.style.display = 'none';
    hintContent.style.display = 'none';

    renderStepsTrack();
    announce(`Repte ${idx + 1} de 20: ${item.name}. ${item.desc}.`);
  }

  function checkMeasureAnswer() {
    const rawVal = answerInput.value.trim();
    if (!rawVal) {
      showFeedback('error', 'Falta la resposta', 'Escriu un nombre en graus abans de comprovar.');
      answerInput.focus();
      return;
    }

    const studentAnswer = parseFloat(rawVal);
    if (isNaN(studentAnswer) || studentAnswer < 0 || studentAnswer > 360) {
      showFeedback('error', 'Nombre no vàlid', 'Introdueix un valor entre 0º i 360º.');
      return;
    }

    const idx = state.measureSeries.currentIndex;
    const record = state.measureSeries.history[idx];
    const realAngle = record.targetAngle;
    const diff = Math.abs(studentAnswer - realAngle);
    const tol = state.tolerance;

    record.attempts++;
    record.studentAnswer = studentAnswer;

    // 1. Resposta correcta
    if (diff <= tol) {
      window.soundController.playSuccess();
      const classify = GeometryEngine.classifyAngle(realAngle);

      // Puntuació pedagògica:
      // 1r intent: 0.5 punts (100%)
      // 2n intent: 0.35 punts (70%)
      // 3r intent o més / amb pistes: 0.2 punts (40%)
      if (record.attempts === 1) {
        record.scoreEarned = 0.5;
        record.status = 'success-first';
      } else if (record.attempts === 2) {
        record.scoreEarned = 0.35;
        record.status = 'success-retry';
      } else {
        record.scoreEarned = 0.2;
        record.status = 'success-retry';
      }

      showFeedback(
        'success',
        'Molt bona feina! Resposta correcta! 🎉',
        `Has mesurat ${studentAnswer}º. La mesura exacta és ${realAngle}º.<br>
         Es tracta d'un <strong>${classify.name}</strong> (${classify.desc}).`,
        `Puntuació aconseguida en aquest repte: <strong>+${record.scoreEarned} punts</strong> (${record.attempts} intent/s).`
      );

      btnRevealSolution.style.display = 'none';
      btnNextChallenge.style.display = 'inline-flex';

      if (idx === state.measureSeries.totalChallenges - 1) {
        btnNextChallenge.innerHTML = 'Consultar informe i nota final 🏆 ➔';
      } else {
        btnNextChallenge.innerHTML = `Següent repte (${idx + 2}/20) ➔`;
      }
      btnNextChallenge.focus();

      renderStepsTrack();
      announce(`Correcte! Has aconseguit ${record.scoreEarned} punts.`);
      return;
    }

    // 2. ERROR TÍPIC DE LA DOBLE ESCALA (Lectura del suplementari 180 - alpha)
    const complementaryAngle = 180 - realAngle;
    if (Math.abs(studentAnswer - complementaryAngle) <= tol + 1) {
      record.dualScaleError = true;
      window.soundController.playGentleTryAgain();
      const isRealAcute = realAngle < 90;
      showFeedback(
        'error',
        'Compte amb la doble escala del transportador! 🔍',
        `Has indicat <strong>${studentAnswer}º</strong>, però aquest és el valor de l'escala contrària!<br><br>
         Fixa't bé en la forma de l'angle: és un <strong>${isRealAcute ? 'angle agut (menys de 90º)' : 'angle obtús (més de 90º)'}</strong>.<br>
         <em>Consell clau:</em> Busca el <strong>0º</strong> que coincideix exactament amb el braç de la base i segueix <strong>aquesta mateixa escala</strong> fins a l'altre braç.`,
        'Activa la casella "Guia de l\'escala correcta" a la secció de suport si necessites veure l\'escala destacada en verd.'
      );
      checkRevealSolutionAvailability(record);
      renderStepsTrack();
      announce(`Compte amb l'escala. Has llegit l'escala contrària, ${studentAnswer} graus.`);
      return;
    }

    // 3. Error d'estimació agut vs obtús
    if (studentAnswer > 90 && realAngle < 90) {
      window.soundController.playGentleTryAgain();
      showFeedback(
        'error',
        'Observa l\'obertura de l\'angle 📐',
        `Has respost ${studentAnswer}º (un angle obtús), però l'angle és <strong>agut</strong> (més tancat que una cantonada recta de 90º).<br>
         Comprova que hagis alineat el centre del transportador al vèrtex i llegeix l'escala que comença a 0º.`
      );
      checkRevealSolutionAvailability(record);
      renderStepsTrack();
      announce('Observa l\'obertura: l\'angle és agut, per tant ha de mesurar menys de 90 graus.');
      return;
    }

    if (studentAnswer < 90 && realAngle > 90) {
      window.soundController.playGentleTryAgain();
      showFeedback(
        'error',
        'Observa l\'obertura de l\'angle 📐',
        `Has respost ${studentAnswer}º (un angle agut), però l'angle és <strong>obtús</strong> (més obert que una cantonada recta de 90º).<br>
         Assegura't de seguir l'escala correcta que comença a 0º sobre el braç base.`
      );
      checkRevealSolutionAvailability(record);
      renderStepsTrack();
      announce('Observa l\'obertura: l\'angle és obtús, per tant ha de mesurar més de 90 graus.');
      return;
    }

    // 4. Molt a prop (error petit de lectura)
    if (diff <= 7) {
      window.soundController.playGentleTryAgain();
      showFeedback(
        'info',
        'Molt a prop! T\'has desviat per molt poc 🤏',
        `Has indicat ${studentAnswer}º. Estàs a només ${Math.round(diff)}º de la mesura exacta.<br>
         Revisa bé les ratlletes petites d'1 grau al transportador. Comprova que el centre estigui just sobre el punt del vèrtex.`
      );
      checkRevealSolutionAvailability(record);
      renderStepsTrack();
      announce(`Molt a prop! Estàs a només ${Math.round(diff)} graus de la mesura exacta.`);
      return;
    }

    // 5. Error general
    window.soundController.playGentleTryAgain();
    showFeedback(
      'error',
      'No és la mesura exacta. Tornem-ho a provar! 💪',
      `La mesura de ${studentAnswer}º no s'ajusta a aquest angle.<br>
       <strong>Passos recomanats:</strong><br>
       1. Prem el botó <em>"Alinea al vèrtex"</em>.<br>
       2. Gira el transportador fins que la línia de fe (el 0º) quedi sobre el braç base.<br>
       3. Llegeix el número on creua el segon braç.`
    );
    checkRevealSolutionAvailability(record);
    renderStepsTrack();
    announce('No és la mesura exacta. Prova d\'alinear el centre al vèrtex i la base a zero.');
  }

  function checkRevealSolutionAvailability(record) {
    if (record.attempts >= 2) {
      btnRevealSolution.style.display = 'block';
    }
  }

  function revealSolution() {
    const idx = state.measureSeries.currentIndex;
    const record = state.measureSeries.history[idx];
    const realAngle = record.targetAngle;
    const classify = GeometryEngine.classifyAngle(realAngle);

    record.scoreEarned = 0;
    record.status = 'assisted';

    showFeedback(
      'info',
      'Solució del repte 💡',
      `Aquest angle mesura exactament <strong>${realAngle}º</strong> (${classify.name}).<br>
       Pots avançar al següent repte per continuar sumant punts.`,
      'Puntuació en aquest repte: 0 punts (suport utilitzat).'
    );

    btnRevealSolution.style.display = 'none';
    btnNextChallenge.style.display = 'inline-flex';

    if (idx === state.measureSeries.totalChallenges - 1) {
      btnNextChallenge.innerHTML = 'Consultar informe i nota final 🏆 ➔';
    } else {
      btnNextChallenge.innerHTML = `Següent repte (${idx + 2}/20) ➔`;
    }
    btnNextChallenge.focus();

    renderStepsTrack();
    announce(`La solució és ${realAngle} graus.`);
  }

  function advanceToNextChallenge() {
    const curIdx = state.measureSeries.currentIndex;
    if (curIdx < state.measureSeries.totalChallenges - 1) {
      loadMeasureChallenge(curIdx + 1);
    } else {
      showFinalEvaluation();
    }
  }

  // ==========================================
  // INFORME FINAL D'AVALUACIÓ I QUALIFICACIÓ (20 REPTES)
  // ==========================================
  function showFinalEvaluation() {
    state.measureSeries.isFinished = true;
    challengeActiveContainer.style.display = 'none';
    challengeResultsCard.style.display = 'block';

    const history = state.measureSeries.history;
    const totalScore = calculateCurrentScore();
    const finalGrade = Math.min(10, Math.max(0, Math.round(totalScore * 10) / 10));

    resultsFinalGrade.textContent = finalGrade.toFixed(1);

    // Càlcul d'estadístiques
    const firstTryCount = history.filter(h => h.status === 'success-first').length;
    const retryCount = history.filter(h => h.status === 'success-retry').length;
    const assistedCount = history.filter(h => h.status === 'assisted').length;
    const dualScaleErrors = history.filter(h => h.dualScaleError).length;
    const successTotal = firstTryCount + retryCount;
    const accuracyRate = Math.round((successTotal / state.measureSeries.totalChallenges) * 100);

    resultsStatFirst.textContent = `${firstTryCount} / 20`;
    resultsStatRetry.textContent = `${retryCount} / 20`;
    resultsStatScaleErrors.textContent = `${dualScaleErrors}`;
    resultsStatAccuracy.textContent = `${accuracyRate}%`;

    // Qualificació segons el marc curricular de Primària a Catalunya
    let levelBadgeText = '';
    let levelBadgeClass = '';
    let pedagogicalComment = '';

    if (finalGrade >= 9.0) {
      levelBadgeText = '🌟 Assoliment Excel·lent (AE)';
      levelBadgeClass = 'badge-ae';
      pedagogicalComment = `
        <strong>Excel·lent competència espacial i geomètrica!</strong><br>
        Has demostrat un domini extraordinari del transportador d'angles sexagesimal, tant en angles orientats horitzontalment com en posicions inclinades.
        Distingeixes amb agilitat i precisió angles aguts, rectes i obtusos, evitant amb èxit els errors de lectura de la doble escala. Moltes felicitats!
      `;
    } else if (finalGrade >= 7.0) {
      levelBadgeText = '👍 Assoliment Notable (AN)';
      levelBadgeClass = 'badge-an';
      pedagogicalComment = `
        <strong>Molt bon nivell d'aprenentatge!</strong><br>
        Has superat amb solvència la majoria de reptes de mesura. Saps alinear el centre al vèrtex i identificar correctament l'obertura dels angles.
        ${dualScaleErrors > 0 ? `Com a consell de millora: en algun repte has mirat l'escala complementària. Recorda sempre seguir el zero que recolza sobre el braç base abans de llegir el número.` : `Continua practicant amb angles que tinguin la base girada per consolidar la màxima precisió.`}
      `;
    } else if (finalGrade >= 5.0) {
      levelBadgeText = '✔️ Assoliment Satisfactori (AS)';
      levelBadgeClass = 'badge-as';
      pedagogicalComment = `
        <strong>Assoliment assolit amb bons progressos!</strong><br>
        Comprends la funció del transportador i saps reconèixer les diferències bàsiques entre un angle agut i un d'obtús.
        Per millorar la nota, et recomanem fer servir més sovint els botons de bastida DUA (com la <em>"Guia de l'escala correcta"</em> o la <em>"Guia de 90º"</em>) per assegurar-te d'escollir l'escala adequada abans d'escriure la resposta.
      `;
    } else {
      levelBadgeText = '🌱 En Procés de Millora (NA)';
      levelBadgeClass = 'badge-na';
      pedagogicalComment = `
        <strong>Treballant en la comprensió dels angles!</strong><br>
        Mesurar angles amb un transportador requereix pràctica motriu i atenció a la doble escala. 
        Et suggerim passar una estona al <strong>Mode 1 (Explora i Aprèn)</strong> manipulant lliurement els braços i observant com canvia la mesura abans de tornar a intentar els 20 reptes. Segur que a la segona anirà molt millor!
      `;
    }

    resultsLevelBadge.textContent = levelBadgeText;
    resultsLevelBadge.className = `results-level-badge ${levelBadgeClass}`;
    resultsFeedbackBox.innerHTML = pedagogicalComment;

    // Actualitzar metadades de l'alumne/a a l'informe final
    if (summaryStudentName) {
      summaryStudentName.textContent = (inputStudentName && inputStudentName.value.trim()) || 'Alumne/a anònim/a';
    }
    if (summaryStudentGroup) {
      summaryStudentGroup.textContent = (inputStudentGroup && inputStudentGroup.value.trim()) || 'Sense grup especificat';
    }
    if (summarySessionDate) {
      summarySessionDate.textContent = (inputStudentDate && inputStudentDate.value) || '-';
    }

    // Generar la taula del full de registre detallat de les 20 mesures
    if (recordTableBody) {
      recordTableBody.innerHTML = '';
      history.forEach((h, i) => {
        const tr = document.createElement('tr');
        const classify = GeometryEngine.classifyAngle(h.targetAngle);

        const studentAnsText = h.studentAnswer !== null ? `${h.studentAnswer}º` : 'Sense resposta';
        let attemptsText = '';
        if (h.status === 'success-first') {
          attemptsText = '1r intent';
        } else if (h.status === 'success-retry') {
          attemptsText = `${h.attempts} intents ${h.hintsUsed > 0 ? '+ pista' : ''}`;
        } else {
          attemptsText = 'Solució vista';
        }

        let badgeClass = 'score-zero';
        if (h.scoreEarned >= 0.5) badgeClass = 'score-full';
        else if (h.scoreEarned >= 0.35) badgeClass = 'score-mid';
        else if (h.scoreEarned > 0) badgeClass = 'score-low';

        tr.innerHTML = `
          <td style="font-weight: 700; text-align: center;">${i + 1}</td>
          <td>${h.name}</td>
          <td>${classify.name}</td>
          <td style="font-weight: 700; text-align: right;">${h.targetAngle}º</td>
          <td style="text-align: right;">${studentAnsText}</td>
          <td style="font-size: 0.78rem;">${attemptsText}</td>
          <td style="text-align: center;">
            <span class="badge-score-cell ${badgeClass}">+${h.scoreEarned.toFixed(2)}</span>
          </td>
        `;
        recordTableBody.appendChild(tr);
      });
    }

    window.soundController.playSuccess();
    announce(`Avaluació finalitzada! La teva nota final és de ${finalGrade.toFixed(1)} sobre 10. ${levelBadgeText}.`);

    // Desplaçar suaument la vista cap a la targeta de resultats
    challengeResultsCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // ==========================================
  // EXPORTACIÓ DE LA FITXA DE REGISTRE EN CSV (EXCEL)
  // ==========================================
  function exportRecordCSV() {
    window.soundController.playClick();
    const studentName = (inputStudentName && inputStudentName.value.trim()) || 'Alumne';
    const studentGroup = (inputStudentGroup && inputStudentGroup.value.trim()) || 'SenseGrup';
    const dateStr = (inputStudentDate && inputStudentDate.value) || new Date().toLocaleDateString('ca-ES');
    const totalScore = calculateCurrentScore();
    const finalGrade = Math.min(10, Math.max(0, Math.round(totalScore * 10) / 10)).toFixed(1);
    const levelText = resultsLevelBadge ? resultsLevelBadge.textContent.trim() : '';

    let csvContent = "\uFEFF"; // UTF-8 BOM per a compatibilitat total amb Microsoft Excel
    csvContent += `"L'Angleòmetre - Fitxa de Registre d'Avaluació de Matemàtiques"\n`;
    csvContent += `"Alumne/a:","${studentName}","Grup/Classe:","${studentGroup}","Data:","${dateStr}"\n`;
    csvContent += `"Nota Final:","${finalGrade} / 10","Nivell:","${levelText}"\n\n`;
    csvContent += `"Núm. Repte","Situació / Context","Tipus d'Angle","Mesura Real (º)","Resposta Alumne (º)","Intents","Punts Obtinguts"\n`;

    state.measureSeries.history.forEach((h, i) => {
      const classify = GeometryEngine.classifyAngle(h.targetAngle);
      const ans = h.studentAnswer !== null ? `${h.studentAnswer}º` : "Sense resposta";
      csvContent += `"${i + 1}","${h.name}","${classify.name}","${h.targetAngle}º","${ans}","${h.attempts}","${h.scoreEarned.toFixed(2)}"\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const safeName = studentName.replace(/[^a-zA-Z0-9àèéíòóúç·_-]/g, '_');
    a.download = `Registre_Angles_${safeName}_${dateStr.replace(/\//g, '-')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    announce("Fitxa de registre en format CSV descarregada amb èxit.");
  }

  function showFeedback(type, title, body, detail = '') {
    feedbackBox.className = `feedback-box visible ${type}`;
    feedbackTitle.innerHTML = title;
    feedbackBody.innerHTML = body;
    feedbackDetail.innerHTML = detail;
    feedbackDetail.style.display = detail ? 'block' : 'none';
  }

  // Pistes graduals DUA
  function triggerNextHint() {
    window.soundController.playHint();
    const idx = state.measureSeries.currentIndex;
    const record = state.measureSeries.history[idx];
    record.hintsUsed++;
    hintContent.style.display = 'block';

    const realAngle = record.targetAngle;
    const isAcute = realAngle < 90;

    if (record.hintsUsed === 1) {
      hintText.innerHTML = `<strong>Pista 1 (Classificació):</strong> L'angle és <strong>${isAcute ? 'AGUT (menor de 90º)' : 'OBTÚS (major de 90º)'}</strong>. Si l'escala et dona un valor ${isAcute ? 'superior a 90º' : 'inferior a 90º'}, estàs mirant l'escala equivocada!`;
      announce(`Pista 1: L'angle és ${isAcute ? 'agut, menor de 90 graus' : 'obtús, major de 90 graus'}.`);
    } else if (record.hintsUsed === 2) {
      hintText.innerHTML = `<strong>Pista 2 (Alineació):</strong> Utilitza el botó <em>"Alinea al vèrtex"</em> i després gira el transportador perquè la línia de fe coincideixi amb el braç base.`;
      announce("Pista 2: Fes servir el botó d'alinear al vèrtex.");
    } else {
      const lower = Math.floor(realAngle / 10) * 10;
      const upper = lower + 10;
      hintText.innerHTML = `<strong>Pista 3 (Interval):</strong> La mesura exacta està entre <strong>${lower}º i ${upper}º</strong>.`;
      announce(`Pista 3: La mesura exacta està entre ${lower} i ${upper} graus.`);
    }
  }

  // ==========================================
  // MODE 3: REPTE DE CONSTRUCCIÓ ("DIBUIXA L'ANGLE")
  // ==========================================
  function loadNewBuildChallenge() {
    const angles = [30, 45, 60, 75, 90, 105, 120, 135, 150];
    const target = angles[Math.floor(Math.random() * angles.length)];

    state.buildChallenge = {
      targetAngle: target,
      attempts: 0
    };

    buildTargetText.textContent = `${target}º`;
    buildCurrentVal.textContent = `20º`;

    protractor.setAngle(20, 0);
    protractor.alignToVertex();
    protractor.alignToBase();

    buildFeedbackBox.className = 'feedback-box';
    btnNextBuild.style.display = 'none';

    announce(`Nou repte de construcció: mou el braç vermell fins a construir un angle de ${target} graus.`);
  }

  function checkBuildAnswer() {
    const currentAngle = protractor.targetAngle;
    const target = state.buildChallenge.targetAngle;
    const diff = Math.abs(currentAngle - target);

    state.buildChallenge.attempts++;

    if (diff <= state.tolerance) {
      window.soundController.playSuccess();
      buildFeedbackBox.className = 'feedback-box visible success';
      buildFeedbackTitle.innerHTML = 'Construcció excel·lent! 🎯';
      buildFeedbackBody.innerHTML = `Has col·locat el braç a ${Math.round(currentAngle)}º (objectiu: ${target}º). Molt bona precisió geomètrica!`;
      btnNextBuild.style.display = 'inline-flex';
      btnNextBuild.focus();
      announce(`Construcció excel·lent! Has assolit els ${target} graus.`);
    } else {
      window.soundController.playGentleTryAgain();
      buildFeedbackBox.className = 'feedback-box visible error';
      buildFeedbackTitle.innerHTML = 'Encara no és la mesura exacta 🤔';
      const dir = currentAngle < target ? 'obrir-lo més' : 'tancar-lo una mica';
      buildFeedbackBody.innerHTML = `Ara mateix l'angle fa ${Math.round(currentAngle)}º i busquem <strong>${target}º</strong>. Has d'<strong>${dir}</strong>.`;
      announce(`L'angle fa ${Math.round(currentAngle)} graus i cerquem ${target} graus. Has de ${dir}.`);
    }
  }

  // ==========================================
  // BASTIDES DUA I CANVI DE SUPORTS
  // ==========================================
  chk90Guide.addEventListener('change', (e) => {
    protractor.scaffolding.show90Guide = e.target.checked;
    protractor.renderAngle();
    window.soundController.playClick();
    announce(e.target.checked ? "Guia d'angle recte de 90 graus activada." : "Guia de 90 graus desactivada.");
  });

  chkScaleGuide.addEventListener('change', (e) => {
    protractor.scaffolding.highlightScale = e.target.checked;
    protractor.applyScaffoldingHighlights();
    window.soundController.playClick();
    announce(e.target.checked ? "Guia d'escala correcta activada: nombres verds destacats." : "Guia d'escala desactivada.");
  });

  btnHintTrigger.addEventListener('click', triggerNextHint);

  selectTolerance.addEventListener('change', (e) => {
    state.tolerance = parseInt(e.target.value, 10);
    announce(`Tolerància de mesura canviada a més o menys ${state.tolerance} graus.`);
  });

  // ==========================================
  // CONTROLS DE MOTRICITAT I TECLAT PER AL TRANSPORTADOR
  // ==========================================
  btnAlignVertex.addEventListener('click', () => {
    protractor.alignToVertex();
    announce("Transportador centrat al vèrtex de l'angle.");
  });

  btnAlignBase.addEventListener('click', () => {
    protractor.alignToBase();
    announce("Línia de fe del transportador alineada amb la base.");
  });

  btnResetProtractor.addEventListener('click', () => {
    protractor.resetProtractor();
    announce("Transportador restaurat a la posició inicial.");
  });

  btnMoveUp.addEventListener('click', () => protractor.nudgeMove(0, -6));
  btnMoveDown.addEventListener('click', () => protractor.nudgeMove(0, 6));
  btnMoveLeft.addEventListener('click', () => protractor.nudgeMove(-6, 0));
  btnMoveRight.addEventListener('click', () => protractor.nudgeMove(6, 0));

  btnRotateClockwise.addEventListener('click', () => protractor.nudgeRotate(1));
  btnRotateCounterClockwise.addEventListener('click', () => protractor.nudgeRotate(-1));
  btnRotateCw5.addEventListener('click', () => protractor.nudgeRotate(5));
  btnRotateCcw5.addEventListener('click', () => protractor.nudgeRotate(-5));

  // Dreceres de teclat globals quan s'està dins de l'àrea de simulació
  svgEl.setAttribute('tabindex', '0');
  svgEl.setAttribute('role', 'region');
  svgEl.setAttribute('aria-label', "Àrea geomètrica interactiva. Fes servir les tecles de fletxa per desplaçar el transportador, i les tecles R o T per rotar-lo.");

  svgEl.addEventListener('keydown', (e) => {
    let handled = true;
    switch (e.key) {
      case 'ArrowUp':
        protractor.nudgeMove(0, -5);
        break;
      case 'ArrowDown':
        protractor.nudgeMove(0, 5);
        break;
      case 'ArrowLeft':
        protractor.nudgeMove(-5, 0);
        break;
      case 'ArrowRight':
        protractor.nudgeMove(5, 0);
        break;
      case 'r':
      case 'R':
        protractor.nudgeRotate(e.shiftKey ? 5 : 1);
        break;
      case 'e':
      case 'E':
        protractor.nudgeRotate(e.shiftKey ? -5 : -1);
        break;
      case 'v':
      case 'V':
        protractor.alignToVertex();
        break;
      case 'b':
      case 'B':
        protractor.alignToBase();
        break;
      default:
        handled = false;
    }
    if (handled) {
      e.preventDefault();
    }
  });

  // ==========================================
  // CONFIGURACIONS D'ACCESSIBILITAT WCAG
  // ==========================================
  btnHighContrast.addEventListener('click', () => {
    const isHigh = document.body.classList.toggle('high-contrast');
    btnHighContrast.setAttribute('aria-pressed', isHigh);
    window.soundController.playClick();
    announce(isHigh ? "Mode contrast alt activat." : "Mode contrast normal restablert.");
  });

  btnFontSize.addEventListener('click', () => {
    state.fontSizeLevel = (state.fontSizeLevel + 1) % 3;
    document.body.classList.remove('font-large', 'font-xlarge');
    if (state.fontSizeLevel === 1) {
      document.body.classList.add('font-large');
      announce("Mida de lletra gran activada.");
    } else if (state.fontSizeLevel === 2) {
      document.body.classList.add('font-xlarge');
      announce("Mida de lletra molt gran activada.");
    } else {
      announce("Mida de lletra normal restablerta.");
    }
    window.soundController.playClick();
  });

  btnSoundToggle.addEventListener('click', () => {
    const muted = window.soundController.toggleMute();
    btnSoundToggle.setAttribute('aria-pressed', muted);
    btnSoundToggle.innerHTML = muted ? '🔇 So apagat' : '🔊 So actiu';
    announce(muted ? "Efectes de so desactivats." : "Efectes de so activats.");
  });

  btnSpeechToggle.addEventListener('click', () => {
    state.speechEnabled = !state.speechEnabled;
    btnSpeechToggle.setAttribute('aria-pressed', state.speechEnabled);
    btnSpeechToggle.innerHTML = state.speechEnabled ? '🗣️ Veu activa' : '🗣️ Veu apagada';
    window.soundController.playClick();
    announce(state.speechEnabled ? "Lector de veu en català activat." : "Lector de veu desactivat.");
  });

  // ==========================================
  // EVENTS DE LA SÈRIE DE REPTES I AVALUACIÓ
  // ==========================================
  btnCheckAnswer.addEventListener('click', checkMeasureAnswer);
  btnNextChallenge.addEventListener('click', advanceToNextChallenge);
  btnRevealSolution.addEventListener('click', revealSolution);

  answerInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      checkMeasureAnswer();
    }
  });

  // Botons de la targeta d'informe final
  btnRestartChallenges.addEventListener('click', () => {
    initMeasureSeries();
    window.soundController.playClick();
    announce("Sèrie de 20 reptes reiniciada. Comencem el repte 1!");
  });

  btnPrintReport.addEventListener('click', () => {
    window.soundController.playClick();
    window.print();
  });

  if (btnExportCsv) {
    btnExportCsv.addEventListener('click', exportRecordCSV);
  }

  // Mode de Construcció
  btnCheckBuild.addEventListener('click', checkBuildAnswer);
  btnNextBuild.addEventListener('click', loadNewBuildChallenge);

  // Pestanyes de Mode
  tabExplore.addEventListener('click', () => switchMode('explore'));
  tabChallengeMeasure.addEventListener('click', () => switchMode('challenge-measure'));
  tabChallengeBuild.addEventListener('click', () => switchMode('challenge-build'));

  // Diàlegs Modals
  function openModal() {
    modalPedagogy.classList.add('open');
    modalPedagogy.setAttribute('aria-hidden', 'false');
    btnClosePedagogy.focus();
    window.soundController.playClick();
    announce("Diàleg obert: Marc pedagògic, accessibilitat i transparència de la intel·ligència artificial.");
  }

  function closeModal() {
    modalPedagogy.classList.remove('open');
    modalPedagogy.setAttribute('aria-hidden', 'true');
    btnOpenPedagogy.focus();
    window.soundController.playClick();
  }

  btnOpenPedagogy.addEventListener('click', openModal);
  btnClosePedagogy.addEventListener('click', closeModal);

  modalPedagogy.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });

  modalPedagogy.addEventListener('click', (e) => {
    if (e.target === modalPedagogy) closeModal();
  });

  // ==========================================
  // INICI AUTOMÀTIC EN MODE EXPLORACIÓ
  // ==========================================
  switchMode('explore');
});
