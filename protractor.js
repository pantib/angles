/**
 * MOTOR GEOMÈTRIC I RENDERITZADOR DE TRANSPORTADOR D'ANGLES (SVG)
 * Dissenyat segons criteris de rigor matemàtic i DUA per al Cicle Superior.
 */

class GeometryEngine {
  /**
   * Normalitza un angle en graus a l'interval [0, 360)
   */
  static normalizeAngle(deg) {
    let a = deg % 360;
    if (a < 0) a += 360;
    return a;
  }

  /**
   * Calcula l'angle en graus d'un punt (x,y) respecte a l'origen (vx,vy)
   * En coordenades de pantalla SVG (Y creix cap avall).
   */
  static getAngleFromPoint(vx, vy, px, py) {
    const dx = px - vx;
    const dy = py - vy;
    // Math.atan2(dy, dx) dona radians entre -PI i +PI
    let deg = (Math.atan2(dy, dx) * 180) / Math.PI;
    return GeometryEngine.normalizeAngle(deg);
  }

  /**
   * Classifica l'angle segons la taxonomia curricular de Primària
   */
  static classifyAngle(deg) {
    const rounded = Math.round(deg * 10) / 10;
    if (rounded === 0) return { type: 'nul', name: 'Angle Nul', desc: '0º: Els dos braços coincideixen.' };
    if (rounded < 90) return { type: 'agut', name: 'Angle Agut', desc: 'Menys de 90º: Més tancat que un angle recte.' };
    if (rounded === 90) return { type: 'recte', name: 'Angle Recte', desc: 'Exactament 90º: Forma de "L" (com una cantonada d\'un foli).' };
    if (rounded < 180) return { type: 'obtus', name: 'Angle Obtús', desc: 'Entre 90º i 180º: Més obert que un angle recte.' };
    if (rounded === 180) return { type: 'pla', name: 'Angle Pla', desc: 'Exactament 180º: Una línia recta contínua.' };
    if (rounded < 360) return { type: 'reflex', name: 'Angle Còncau / Reflex', desc: 'Més de 180º i menys de 360º.' };
    return { type: 'complet', name: 'Angle Complet', desc: '360º: Una volta sencera.' };
  }
}

class ProtractorView {
  constructor(svgElement, options = {}) {
    this.svg = svgElement;
    this.options = Object.assign({
      radius: 175,
      x: 380,
      y: 280,
      rotation: 0,
      interactive: true,
      onProtractorMove: null,
      onAngleChange: null
    }, options);

    // Estat del transportador
    this.x = this.options.x;
    this.y = this.options.y;
    this.rotation = this.options.rotation; // graus
    this.radius = this.options.radius;

    // Estat de l'angle a mesurar
    this.vertex = { x: 380, y: 320 };
    this.baseAngle = 0; // graus de la línia base (Ray 1)
    this.targetAngle = 55; // obertura en graus (Ray 2 = baseAngle - targetAngle)
    this.isAngleDraggable = false; // per a mode exploració

    // Bastides DUA actives
    this.scaffolding = {
      show90Guide: false,
      highlightScale: false, // ressalta escala correcta
      autoSnap: false,
      contextImage: null // per a reptes contextualitzats
    };

    // Estat d'arrossegament
    this.dragTarget = null;
    this.dragOffset = { x: 0, y: 0 };
    this.dragStartAngle = 0;

    this.initDOM();
    this.attachEvents();
    this.render();
  }

  initDOM() {
    this.svg.innerHTML = `
      <defs>
        <!-- Filtre d'ombra suau per al transportador -->
        <filter id="protractor-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="6" flood-opacity="0.22" />
        </filter>
        <!-- Textura de fons de quadrícula mil·limètrica suau -->
        <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e6ecf5" stroke-width="1.2" />
          <path d="M 20 0 L 20 40 M 0 20 L 40 20" fill="none" stroke="#f1f5fa" stroke-width="0.8" />
        </pattern>
      </defs>

      <!-- Fons amb quadrícula -->
      <rect width="100%" height="100%" fill="url(#grid-pattern)" />

      <!-- Capa de context de la vida real (tisores, rellotge, rampa...) -->
      <g id="context-layer"></g>

      <!-- Capa de l'angle a mesurar -->
      <g id="angle-layer">
        <!-- Guia d'angle recte (90º) de suport DUA -->
        <line id="guide-90-line" stroke="#855300" stroke-width="2" stroke-dasharray="6,4" opacity="0" />
        <text id="guide-90-text" fill="#855300" font-size="12" font-weight="700" opacity="0"></text>

        <!-- Arc de l'angle -->
        <path id="angle-arc" fill="rgba(25, 82, 165, 0.15)" stroke="#1952a5" stroke-width="2.5" />
        
        <!-- Braç 1 (Base de referència) -->
        <line id="ray-base" stroke="#0f346b" stroke-width="4.5" stroke-linecap="round" />
        <!-- Braç 2 (Braç mòbil) -->
        <line id="ray-mobile" stroke="#c44000" stroke-width="4.5" stroke-linecap="round" />

        <!-- Tirador interactiu per moure el braç mòbil en mode exploració -->
        <g id="mobile-handle" cursor="grab" opacity="0">
          <circle r="14" fill="#c44000" stroke="#ffffff" stroke-width="3" filter="url(#protractor-shadow)" />
          <circle r="4" fill="#ffffff" />
        </g>

        <!-- Vèrtex de l'angle -->
        <circle id="angle-vertex" r="7" fill="#0f346b" stroke="#ffffff" stroke-width="2.5" />
        <text id="angle-arc-label" text-anchor="middle" font-size="15" font-weight="800" fill="#1952a5"></text>
      </g>

      <!-- Capa del transportador d'angles interactiu -->
      <g id="protractor-group" filter="url(#protractor-shadow)" cursor="move">
        <!-- Semicercle d'acrílic transparent -->
        <path id="protractor-body" fill="rgba(235, 245, 255, 0.82)" stroke="#1952a5" stroke-width="2.5" />
        
        <!-- Línia de fe (base 0-180º) -->
        <line id="protractor-baseline" stroke="#0f346b" stroke-width="2.5" />

        <!-- Línia vertical a 90º -->
        <line id="protractor-90line" stroke="#1952a5" stroke-width="1.5" stroke-dasharray="3,3" />

        <!-- Graduacions i números (generats dinàmicament) -->
        <g id="protractor-ticks"></g>

        <!-- Orifici o creu de mira del centre -->
        <g id="protractor-center">
          <circle r="6" fill="none" stroke="#c44000" stroke-width="2" />
          <line x1="-12" y1="0" x2="12" y2="0" stroke="#c44000" stroke-width="1.5" />
          <line x1="0" y1="-12" x2="0" y2="12" stroke="#c44000" stroke-width="1.5" />
        </g>

        <!-- Tirador de rotació superior (Knob) -->
        <g id="rotate-handle" cursor="grab" aria-label="Tirador de rotació del transportador">
          <circle id="rotate-handle-bg" r="16" fill="#1952a5" stroke="#ffffff" stroke-width="2.5" />
          <path d="M -6 -2 A 7 7 0 1 1 6 2 M 6 -1 L 8 4 L 3 3" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" />
        </g>

        <!-- Tirador central per desplaçar -->
        <g id="center-move-handle" cursor="move" aria-label="Tirador de desplaçament">
          <circle r="15" fill="rgba(25, 82, 165, 0.15)" stroke="#1952a5" stroke-width="1.5" stroke-dasharray="3,2" />
        </g>
      </g>
    `;

    this.dom = {
      contextLayer: this.svg.querySelector('#context-layer'),
      angleLayer: this.svg.querySelector('#angle-layer'),
      guide90Line: this.svg.querySelector('#guide-90-line'),
      guide90Text: this.svg.querySelector('#guide-90-text'),
      angleArc: this.svg.querySelector('#angle-arc'),
      rayBase: this.svg.querySelector('#ray-base'),
      rayMobile: this.svg.querySelector('#ray-mobile'),
      mobileHandle: this.svg.querySelector('#mobile-handle'),
      angleVertex: this.svg.querySelector('#angle-vertex'),
      angleArcLabel: this.svg.querySelector('#angle-arc-label'),
      protractorGroup: this.svg.querySelector('#protractor-group'),
      protractorBody: this.svg.querySelector('#protractor-body'),
      protractorBaseline: this.svg.querySelector('#protractor-baseline'),
      protractor90line: this.svg.querySelector('#protractor-90line'),
      protractorTicks: this.svg.querySelector('#protractor-ticks'),
      rotateHandle: this.svg.querySelector('#rotate-handle')
    };

    this.buildProtractorTicks();
  }

  /**
   * Construeix les marques de graduació (cada 1º, 5º i 10º) i la doble numeració (0-180 exterior i interior)
   */
  buildProtractorTicks() {
    const R = this.radius;
    let ticksHtml = '';

    // Dibuixar cos del semicercle
    // Arc de 180 graus (des de -R fins a +R en el semiplà superior y <= 0)
    const bodyPath = `M ${-R} 0 A ${R} ${R} 0 0 1 ${R} 0 Z`;
    this.dom.protractorBody.setAttribute('d', bodyPath);
    this.dom.protractorBaseline.setAttribute('x1', -R);
    this.dom.protractorBaseline.setAttribute('y1', 0);
    this.dom.protractorBaseline.setAttribute('x2', R);
    this.dom.protractorBaseline.setAttribute('y2', 0);
    this.dom.protractor90line.setAttribute('x1', 0);
    this.dom.protractor90line.setAttribute('y1', 0);
    this.dom.protractor90line.setAttribute('x2', 0);
    this.dom.protractor90line.setAttribute('y2', -R);

    // Posició del mànec de rotació (al vèrtex superior de l'arc, r + 24)
    this.dom.rotateHandle.setAttribute('transform', `translate(0, ${-R - 22})`);

    // Generació de marques
    for (let deg = 0; deg <= 180; deg++) {
      const rad = (deg * Math.PI) / 180;
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);

      // Coordenades sobre la vora exterior
      const xOuter = R * cos;
      const yOuter = -R * sin;

      let tickLen = 4;
      let strokeWidth = 1;
      let is10 = deg % 10 === 0;
      let is5 = deg % 5 === 0;

      if (is10) {
        tickLen = 14;
        strokeWidth = 1.8;
      } else if (is5) {
        tickLen = 9;
        strokeWidth = 1.2;
      }

      const xInner = (R - tickLen) * cos;
      const yInner = -(R - tickLen) * sin;

      ticksHtml += `<line x1="${xOuter}" y1="${yOuter}" x2="${xInner}" y2="${yInner}" stroke="#1c2530" stroke-width="${strokeWidth}" />`;

      // Números cada 10 graus
      if (is10) {
        // Escala exterior (0º a la dreta -> 180º a l'esquerra)
        const outerDeg = deg;
        const rTextOuter = R - 24;
        const txOuter = rTextOuter * cos;
        const tyOuter = -rTextOuter * sin;

        // Escala interior (180º a la dreta -> 0º a l'esquerra)
        const innerDeg = 180 - deg;
        const rTextInner = R - 40;
        const txInner = rTextInner * cos;
        const tyInner = -rTextInner * sin;

        ticksHtml += `
          <text class="tick-label-outer tick-deg-${outerDeg}" x="${txOuter}" y="${tyOuter}" 
            font-size="10" font-weight="700" fill="#0f346b" text-anchor="middle" dominant-baseline="central">${outerDeg}</text>
          <text class="tick-label-inner tick-deg-${innerDeg}" x="${txInner}" y="${tyInner}" 
            font-size="9" font-weight="600" fill="#855300" text-anchor="middle" dominant-baseline="central">${innerDeg}</text>
        `;
      }
    }

    this.dom.protractorTicks.innerHTML = ticksHtml;
  }

  /**
   * Actualitza la vista gràfica completa
   */
  render() {
    this.renderAngle();
    this.renderProtractor();
    this.applyScaffoldingHighlights();
  }

  renderAngle() {
    const vx = this.vertex.x;
    const vy = this.vertex.y;
    const rayLength = 230;

    // Angle de la base (Ray 1) en radians
    const baseRad = (this.baseAngle * Math.PI) / 180;
    const bx = vx + rayLength * Math.cos(baseRad);
    const by = vy + rayLength * Math.sin(baseRad);

    this.dom.rayBase.setAttribute('x1', vx);
    this.dom.rayBase.setAttribute('y1', vy);
    this.dom.rayBase.setAttribute('x2', bx);
    this.dom.rayBase.setAttribute('y2', by);

    // Angle del braç mòbil (Ray 2) = baseAngle - targetAngle (obertura antihorària positiva)
    const mobileDeg = GeometryEngine.normalizeAngle(this.baseAngle - this.targetAngle);
    const mobileRad = (mobileDeg * Math.PI) / 180;
    const mx = vx + rayLength * Math.cos(mobileRad);
    const my = vy + rayLength * Math.sin(mobileRad);

    this.dom.rayMobile.setAttribute('x1', vx);
    this.dom.rayMobile.setAttribute('y1', vy);
    this.dom.rayMobile.setAttribute('x2', mx);
    this.dom.rayMobile.setAttribute('y2', my);

    this.dom.angleVertex.setAttribute('cx', vx);
    this.dom.angleVertex.setAttribute('cy', vy);

    // Tirador interactiu per moure l'angle si està activat
    if (this.isAngleDraggable) {
      this.dom.mobileHandle.setAttribute('opacity', '1');
      this.dom.mobileHandle.setAttribute('transform', `translate(${mx}, ${my})`);
    } else {
      this.dom.mobileHandle.setAttribute('opacity', '0');
    }

    // Arc de l'angle
    const arcRadius = 75;
    const arcStartX = vx + arcRadius * Math.cos(baseRad);
    const arcStartY = vy + arcRadius * Math.sin(baseRad);
    const arcEndX = vx + arcRadius * Math.cos(mobileRad);
    const arcEndY = vy + arcRadius * Math.sin(mobileRad);

    // SVG arc: flag de gran arc si targetAngle > 180
    const largeArcFlag = this.targetAngle > 180 ? 1 : 0;
    // Sweep flag: 0 per sentit antihorari (en coordenades de pantalla on Y va avall)
    const sweepFlag = 0;

    const arcPath = `M ${vx} ${vy} L ${arcStartX} ${arcStartY} A ${arcRadius} ${arcRadius} 0 ${largeArcFlag} ${sweepFlag} ${arcEndX} ${arcEndY} Z`;
    this.dom.angleArc.setAttribute('d', arcPath);

    // Etiqueta del text sobre l'arc
    const midAngleDeg = GeometryEngine.normalizeAngle(this.baseAngle - this.targetAngle / 2);
    const midRad = (midAngleDeg * Math.PI) / 180;
    const labelRadius = arcRadius + 28;
    const lx = vx + labelRadius * Math.cos(midRad);
    const ly = vy + labelRadius * Math.sin(midRad);

    this.dom.angleArcLabel.setAttribute('x', lx);
    this.dom.angleArcLabel.setAttribute('y', ly);

    // Si estem en mode exploració mostrem el valor; en mode repte posem '?'
    if (this.isAngleDraggable) {
      this.dom.angleArcLabel.textContent = `${Math.round(this.targetAngle)}º`;
    } else {
      this.dom.angleArcLabel.textContent = `?º`;
    }

    // Guia de 90 graus (suport DUA)
    if (this.scaffolding.show90Guide) {
      const g90Deg = GeometryEngine.normalizeAngle(this.baseAngle - 90);
      const g90Rad = (g90Deg * Math.PI) / 180;
      const gx = vx + (rayLength - 20) * Math.cos(g90Rad);
      const gy = vy + (rayLength - 20) * Math.sin(g90Rad);

      this.dom.guide90Line.setAttribute('x1', vx);
      this.dom.guide90Line.setAttribute('y1', vy);
      this.dom.guide90Line.setAttribute('x2', gx);
      this.dom.guide90Line.setAttribute('y2', gy);
      this.dom.guide90Line.setAttribute('opacity', '1');

      this.dom.guide90Text.setAttribute('x', gx + 10);
      this.dom.guide90Text.setAttribute('y', gy);
      this.dom.guide90Text.textContent = '90º (Angle recte)';
      this.dom.guide90Text.setAttribute('opacity', '1');
    } else {
      this.dom.guide90Line.setAttribute('opacity', '0');
      this.dom.guide90Text.setAttribute('opacity', '0');
    }
  }

  renderProtractor() {
    this.dom.protractorGroup.setAttribute(
      'transform',
      `translate(${this.x}, ${this.y}) rotate(${this.rotation})`
    );
  }

  /**
   * Ressalta l'escala correcta (DUA: Guia d'escala)
   */
  applyScaffoldingHighlights() {
    const outerLabels = this.dom.protractorTicks.querySelectorAll('.tick-label-outer');
    const innerLabels = this.dom.protractorTicks.querySelectorAll('.tick-label-inner');

    if (!this.scaffolding.highlightScale) {
      outerLabels.forEach(el => {
        el.setAttribute('fill', '#0f346b');
        el.removeAttribute('font-size-adjust');
      });
      innerLabels.forEach(el => {
        el.setAttribute('fill', '#855300');
      });
      return;
    }

    // Identificar quina escala és la correcta segons com estigui alineat el transportador
    // El zero correcte és el que queda més proper a la línia base de l'angle
    // En el nostre disseny, si la línia base apunta cap a la dreta del transportador, s'usa l'escala exterior (0 a la dreta).
    // Si apunta cap a l'esquerra, s'usa la interior (0 a l'esquerra).
    outerLabels.forEach(el => {
      el.setAttribute('fill', '#15803d'); // verd destacat
      el.setAttribute('font-weight', '900');
    });
    innerLabels.forEach(el => {
      el.setAttribute('fill', '#94a3b8'); // atenuat
    });
  }

  // ==========================================
  // GESTIÓ D'EVENTS I INTERACCIÓ TÀCTIL / RATOLÍ
  // ==========================================

  getSVGCoordinates(evt) {
    const point = this.svg.createSVGPoint();
    if (evt.touches && evt.touches.length > 0) {
      point.x = evt.touches[0].clientX;
      point.y = evt.touches[0].clientY;
    } else {
      point.x = evt.clientX;
      point.y = evt.clientY;
    }
    const ctm = this.svg.getScreenCTM();
    if (ctm) {
      return point.matrixTransform(ctm.inverse());
    }
    return { x: point.x, y: point.y };
  }

  attachEvents() {
    const onStart = (evt) => {
      const coords = this.getSVGCoordinates(evt);
      const target = evt.target;

      // 1. Arrossegar tirador del braç mòbil de l'angle (si actiu)
      if (this.isAngleDraggable && (target.closest('#mobile-handle') || target === this.dom.mobileHandle)) {
        this.dragTarget = 'angle-arm';
        evt.preventDefault();
        window.soundController.playClick();
        return;
      }

      // 2. Girar el transportador pel mànec de rotació
      if (target.closest('#rotate-handle')) {
        this.dragTarget = 'protractor-rotate';
        const center = { x: this.x, y: this.y };
        this.dragStartAngle = GeometryEngine.getAngleFromPoint(center.x, center.y, coords.x, coords.y) - this.rotation;
        evt.preventDefault();
        window.soundController.playClick();
        return;
      }

      // 3. Desplaçar el transportador
      if (target.closest('#protractor-group')) {
        this.dragTarget = 'protractor-move';
        this.dragOffset = {
          x: coords.x - this.x,
          y: coords.y - this.y
        };
        evt.preventDefault();
        return;
      }
    };

    const onMove = (evt) => {
      if (!this.dragTarget) return;
      const coords = this.getSVGCoordinates(evt);
      evt.preventDefault();

      if (this.dragTarget === 'protractor-move') {
        let newX = coords.x - this.dragOffset.x;
        let newY = coords.y - this.dragOffset.y;

        // Comprovació de snap automàtic al vèrtex si està a prop (< 18px)
        const distToVertex = Math.hypot(newX - this.vertex.x, newY - this.vertex.y);
        if (distToVertex < 18) {
          newX = this.vertex.x;
          newY = this.vertex.y;
          if (this.x !== this.vertex.x || this.y !== this.vertex.y) {
            window.soundController.playSnap();
          }
        }

        this.x = newX;
        this.y = newY;
        this.renderProtractor();
        if (this.options.onProtractorMove) {
          this.options.onProtractorMove({ x: this.x, y: this.y, rotation: this.rotation });
        }
      } else if (this.dragTarget === 'protractor-rotate') {
        const curAngle = GeometryEngine.getAngleFromPoint(this.x, this.y, coords.x, coords.y);
        let newRotation = GeometryEngine.normalizeAngle(curAngle - this.dragStartAngle);

        // Snap a la línia de fe (base de l'angle) si està molt a prop (< 3º)
        const diffBase = Math.abs(newRotation - this.baseAngle);
        if (diffBase < 3 || Math.abs(diffBase - 360) < 3) {
          newRotation = this.baseAngle;
          window.soundController.playSnap();
        }

        this.rotation = Math.round(newRotation * 10) / 10;
        this.renderProtractor();
        if (this.options.onProtractorMove) {
          this.options.onProtractorMove({ x: this.x, y: this.y, rotation: this.rotation });
        }
      } else if (this.dragTarget === 'angle-arm') {
        // Càlcul de la nova obertura de l'angle respecte al braç base
        const currentCoordAngle = GeometryEngine.getAngleFromPoint(this.vertex.x, this.vertex.y, coords.x, coords.y);
        // Obertura = baseAngle - currentCoordAngle (normalitzat)
        let opening = GeometryEngine.normalizeAngle(this.baseAngle - currentCoordAngle);
        // Limitem entre 5º i 180º per al currículum de primària
        opening = Math.max(5, Math.min(180, Math.round(opening)));
        this.targetAngle = opening;
        this.renderAngle();
        if (this.options.onAngleChange) {
          this.options.onAngleChange(this.targetAngle);
        }
      }
    };

    const onEnd = () => {
      this.dragTarget = null;
    };

    this.svg.addEventListener('mousedown', onStart);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onEnd);

    this.svg.addEventListener('touchstart', onStart, { passive: false });
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onEnd);
  }

  // ==========================================
  // CONTROLS ACCESSIBLES PER TECLAT I BASTIDES
  // ==========================================

  nudgeMove(dx, dy) {
    this.x += dx;
    this.y += dy;
    this.renderProtractor();
    window.soundController.playClick();
    if (this.options.onProtractorMove) {
      this.options.onProtractorMove({ x: this.x, y: this.y, rotation: this.rotation });
    }
  }

  nudgeRotate(deg) {
    this.rotation = GeometryEngine.normalizeAngle(this.rotation + deg);
    this.renderProtractor();
    window.soundController.playClick();
    if (this.options.onProtractorMove) {
      this.options.onProtractorMove({ x: this.x, y: this.y, rotation: this.rotation });
    }
  }

  alignToVertex() {
    this.x = this.vertex.x;
    this.y = this.vertex.y;
    this.renderProtractor();
    window.soundController.playSnap();
    if (this.options.onProtractorMove) {
      this.options.onProtractorMove({ x: this.x, y: this.y, rotation: this.rotation });
    }
  }

  alignToBase() {
    this.rotation = this.baseAngle;
    this.renderProtractor();
    window.soundController.playSnap();
    if (this.options.onProtractorMove) {
      this.options.onProtractorMove({ x: this.x, y: this.y, rotation: this.rotation });
    }
  }

  resetProtractor() {
    this.x = 220;
    this.y = 200;
    this.rotation = 0;
    this.renderProtractor();
  }

  setAngle(targetDeg, baseDeg = 0) {
    this.targetAngle = targetDeg;
    this.baseAngle = baseDeg;
    this.render();
  }

  setContextOverlay(svgMarkup) {
    this.dom.contextLayer.innerHTML = svgMarkup || '';
  }
}

window.ProtractorView = ProtractorView;
window.GeometryEngine = GeometryEngine;
