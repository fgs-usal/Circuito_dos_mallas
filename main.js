document.addEventListener('DOMContentLoaded', () => {
    const svg = document.getElementById('circuit-svg');
    
    // Coordenadas base para las mallas
    const leftX = 150;
    const midX = 400;
    const rightX = 650;
    const topY = 150;
    const bottomY = 450;

    // Configuración de los elementos
    const elementsConfig = [
        { id: 'el1', typeId: 'el1-type', valId: 'el1-val', unitId: 'el1-unit', pos: 'left', name: 'E1' },
        { id: 'el2', typeId: 'el2-type', valId: 'el2-val', unitId: 'el2-unit', pos: 'top-left', name: 'E2' },
        { id: 'el3', typeId: 'el3-type', valId: 'el3-val', unitId: 'el3-unit', pos: 'mid', name: 'E3' },
        { id: 'el4', typeId: 'el4-type', valId: 'el4-val', unitId: 'el4-unit', pos: 'top-right', name: 'E4' },
        { id: 'el5', typeId: 'el5-type', valId: 'el5-val', unitId: 'el5-unit', pos: 'right', name: 'E5' }
    ];

    function updateUI() {
        elementsConfig.forEach(el => {
            const typeSelect = document.getElementById(el.typeId);
            const valContainer = document.getElementById(el.valId).parentNode;
            const unitSpan = document.getElementById(el.unitId);
            
            if (typeSelect.value === 'short') {
                valContainer.classList.add('hidden');
            } else {
                valContainer.classList.remove('hidden');
                if (typeSelect.value === 'battery') {
                    unitSpan.textContent = 'V';
                } else if (typeSelect.value === 'resistor') {
                    unitSpan.textContent = 'Ω';
                }
            }
        });
    }

    function calculateCircuit() {
        // Obtener valores de cada elemento
        const getV = (el) => document.getElementById(el.typeId).value === 'battery' ? parseFloat(document.getElementById(el.valId).value || 0) : 0;
        const getR = (el) => document.getElementById(el.typeId).value === 'resistor' ? parseFloat(document.getElementById(el.valId).value || 0) : 0;

        const V1 = getV(elementsConfig[0]); const R1 = getR(elementsConfig[0]);
        const V2 = getV(elementsConfig[1]); const R2 = getR(elementsConfig[1]);
        const V3 = getV(elementsConfig[2]); const R3 = getR(elementsConfig[2]);
        const V4 = getV(elementsConfig[3]); const R4 = getR(elementsConfig[3]);
        const V5 = getV(elementsConfig[4]); const R5 = getR(elementsConfig[4]);

        // Ecuaciones de mallas (Kirchhoff)
        // Malla 1: (R1+R2+R3)*I1 - R3*I2 = V1 - V2 - V3
        // Malla 2: -R3*I1 + (R3+R4+R5)*I2 = V3 - V4 - V5
        
        const A = R1 + R2 + R3;
        const B = -R3;
        const C = V1 - V2 - V3;

        const D = -R3;
        const E = R3 + R4 + R5;
        const F = V3 - V4 - V5;

        const det = A * E - B * D;
        
        let I1 = 0, I2 = 0;
        let isError = false;

        if (det === 0) {
            // Si el determinante es 0, hay un lazo sin resistencia (cortocircuito)
            // Solo es error si las fuentes de voltaje en ese lazo no suman 0
            if (C !== 0 || F !== 0) {
                isError = true;
            }
        } else {
            I1 = (C * E - B * F) / det;
            I2 = (A * F - C * D) / det;
        }

        return { I1, I2, R1, R2, R3, R4, R5, V1, V2, V3, V4, V5, isError };
    }

    function drawCircuit() {
        const { I1, I2, R1, R2, R3, R4, R5, V1, V2, V3, V4, V5, isError } = calculateCircuit();

        svg.innerHTML = ''; // Limpiar SVG
        
        // Dibujar cables base (fondo)
        let wiresHTML = `
            <!-- Malla 1 -->
            <line x1="${leftX}" y1="${topY}" x2="${midX}" y2="${topY}" class="circuit-wire" />
            <line x1="${leftX}" y1="${bottomY}" x2="${midX}" y2="${bottomY}" class="circuit-wire" />
            <line x1="${leftX}" y1="${topY}" x2="${leftX}" y2="${bottomY}" class="circuit-wire" />
            <line x1="${midX}" y1="${topY}" x2="${midX}" y2="${bottomY}" class="circuit-wire" />
            
            <!-- Malla 2 -->
            <line x1="${midX}" y1="${topY}" x2="${rightX}" y2="${topY}" class="circuit-wire" />
            <line x1="${midX}" y1="${bottomY}" x2="${rightX}" y2="${bottomY}" class="circuit-wire" />
            <line x1="${rightX}" y1="${topY}" x2="${rightX}" y2="${bottomY}" class="circuit-wire" />
        `;
        svg.innerHTML += wiresHTML;

        if (isError) {
            svg.innerHTML += `<text x="400" y="300" fill="#ff4d4d" font-size="24" font-family="Inter" text-anchor="middle">Cortocircuito infinito detectado. Añada resistencia.</text>`;
            return;
        }

        // Elementos y corrientes correspondientes
        const elementStats = [
            { el: elementsConfig[0], current: I1, r: R1, v: V1, dir: 'up' },         // E1: I1 (sube)
            { el: elementsConfig[1], current: I1, r: R2, v: V2, dir: 'right' },      // E2: I1 (derecha)
            { el: elementsConfig[2], current: I1 - I2, r: R3, v: V3, dir: 'down' },  // E3: I1 - I2 (baja)
            { el: elementsConfig[3], current: I2, r: R4, v: V4, dir: 'right' },      // E4: I2 (derecha)
            { el: elementsConfig[4], current: I2, r: R5, v: V5, dir: 'down' }        // E5: I2 (baja)
        ];

        elementStats.forEach(stat => {
            const type = document.getElementById(stat.el.typeId).value;
            const elObj = stat.el;
            
            let cx, cy, isVertical;
            switch (elObj.pos) {
                case 'left':      cx = leftX; cy = (topY + bottomY) / 2; isVertical = true; break;
                case 'top-left':  cx = (leftX + midX) / 2; cy = topY; isVertical = false; break;
                case 'mid':       cx = midX; cy = (topY + bottomY) / 2; isVertical = true; break;
                case 'top-right': cx = (midX + rightX) / 2; cy = topY; isVertical = false; break;
                case 'right':     cx = rightX; cy = (topY + bottomY) / 2; isVertical = true; break;
            }

            // Calcular voltaje real y dirección de corriente
            let actualV = 0;
            if (type === 'battery') {
                actualV = stat.v;
            } else if (type === 'resistor') {
                actualV = Math.abs(stat.current * stat.r);
            }

            drawElement(type, cx, cy, isVertical, stat.el.name, stat.current, actualV, stat.dir);
        });
    }

    function drawElement(type, x, y, isVertical, name, current, voltage, baseDir) {
        const gap = 60; // Espacio que corta el cable
        
        // Rectángulo de fondo para ocultar el cable debajo del elemento
        const bgW = isVertical ? 20 : gap;
        const bgH = isVertical ? gap : 20;
        const bgX = x - bgW/2;
        const bgY = y - bgH/2;
        
        svg.innerHTML += `<rect x="${bgX-10}" y="${bgY-10}" width="${bgW+20}" height="${bgH+20}" fill="#203a43" />`;

        let elementHTML = '';
        const t = isVertical ? `translate(${x}, ${y}) rotate(90)` : `translate(${x}, ${y})`;

        if (type === 'battery') {
            // Símbolo de batería (para horizontal: + a la izq, - a la der)
            // (para vertical girado: + arriba, - abajo)
            elementHTML = `
                <g transform="${t}">
                    <line x1="-30" y1="0" x2="-10" y2="0" class="circuit-wire" />
                    <line x1="10" y1="0" x2="30" y2="0" class="circuit-wire" />
                    <!-- Línea larga (positivo) -->
                    <line x1="-10" y1="-20" x2="-10" y2="20" class="circuit-element" stroke-width="4" />
                    <text x="-20" y="-25" fill="#00d2ff" font-size="16" font-family="Inter" text-anchor="middle">+</text>
                    <!-- Línea corta (negativo) -->
                    <line x1="10" y1="-10" x2="10" y2="10" class="circuit-element" stroke-width="6" />
                </g>
            `;
        } else if (type === 'resistor') {
            // Símbolo de resistencia (zigzag)
            elementHTML = `
                <g transform="${t}">
                    <line x1="-30" y1="0" x2="-20" y2="0" class="circuit-wire" />
                    <polyline points="-20,0 -15,-15 -5,15 5,-15 15,15 20,0" class="circuit-element" stroke-linejoin="miter" />
                    <line x1="20" y1="0" x2="30" y2="0" class="circuit-wire" />
                </g>
            `;
        } else if (type === 'short') {
            // Cortocircuito (línea recta)
            elementHTML = `
                <g transform="${t}">
                    <line x1="-30" y1="0" x2="30" y2="0" class="circuit-wire" stroke="#00d2ff" />
                </g>
            `;
        }

        svg.innerHTML += elementHTML;

        // Añadir textos (Nombre, V, I)
        let textOffsetX, textOffsetY, textAnchor;
        
        if (isVertical) {
            textOffsetX = 45; // Más lejos del elemento hacia la derecha
            textOffsetY = -20;
            textAnchor = 'start'; // Alinear a la izquierda para que crezca hacia afuera
        } else {
            textOffsetX = 0;
            textOffsetY = -100; // Suficiente espacio para salvar el signo '+' de la batería (y=-25)
            textAnchor = 'middle'; // Centrado sobre el elemento
        }
        
        let labelHTML = `<text x="${x + textOffsetX}" y="${y + textOffsetY}" class="element-label" style="text-anchor: ${textAnchor};">${name}</text>`;
        
        let currentY = y + textOffsetY + 25;
        if (type !== 'short') {
            const vText = type === 'battery' ? `V: ${voltage.toFixed(2)}V` : `ΔV: ${voltage.toFixed(2)}V`;
            labelHTML += `<text x="${x + textOffsetX}" y="${currentY}" class="element-value" style="text-anchor: ${textAnchor};">${vText}</text>`;
            currentY += 25;
        }
        
        // Flecha de corriente
        if (Math.abs(current) > 0.001) {
            const iText = `I: ${Math.abs(current).toFixed(2)}A`;
            
            // Determinar dirección de flecha
            let isPositive = current > 0;
            let arrowSymbol = '';
            
            if (isVertical) {
                if ((baseDir === 'up' && isPositive) || (baseDir === 'down' && !isPositive)) {
                    arrowSymbol = '↑';
                } else {
                    arrowSymbol = '↓';
                }
            } else {
                if ((baseDir === 'right' && isPositive) || (baseDir === 'left' && !isPositive)) {
                    arrowSymbol = '→';
                } else {
                    arrowSymbol = '←';
                }
            }
            
            labelHTML += `<text x="${x + textOffsetX}" y="${currentY}" class="element-value" fill="#fff" style="text-anchor: ${textAnchor};">${iText} <tspan fill="#00d2ff">${arrowSymbol}</tspan></text>`;
        } else {
            const iText = `I: 0.00A`;
            labelHTML += `<text x="${x + textOffsetX}" y="${currentY}" class="element-value" fill="#fff" style="text-anchor: ${textAnchor};">${iText}</text>`;
        }

        svg.innerHTML += labelHTML;
    }

    // Listeners para inputs y selects
    elementsConfig.forEach(el => {
        document.getElementById(el.typeId).addEventListener('change', () => {
            updateUI();
            drawCircuit();
        });
        document.getElementById(el.valId).addEventListener('input', drawCircuit);
    });

    // Inicializar
    updateUI();
    drawCircuit();
});
