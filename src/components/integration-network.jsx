// src/components/integration-network.jsx
import React, { useEffect, useRef, useState } from 'react';
import { dia, shapes, util, V } from '@joint/core';
import { getIntegrationMap } from '../services/s-integration-network';

export default function IntegrationNetwork() {
  const hostRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);
  const [workflows, setWorkflows] = useState([]);

  const BOX_HEIGHT_SCALE = 1.5; // 50% taller boxes

  const ICON_URL = {
    sender:   '/telephone-outbound.svg',
    receiver: '/telephone-inbound.svg',
    workflow: '/cpu.svg',
    gear: '/gear-fill.svg'
  };

  // ---------- helpers
  const resolvePublic = (url) => {
    if (!url) return '';
    if (/^(https?:)?\/\//i.test(url) || /^data:/i.test(url)) return url;
    const base = (process.env.PUBLIC_URL || '').replace(/\/+$/, '');
    if (url.startsWith('/')) return `${base}${url}`;
    return `${base}/${url}`;
  };

  function toWorkflows(arr) {
    if (!Array.isArray(arr)) return [];
    return arr.map(b => ({
      id: b.id,
      artifactID: b.artifactID,
      artifactName: b.artifactName,
      artifactVersion: b.artifactVersion,
      participants: Array.isArray(b.participants) ? b.participants : []
    }));
  }

  // ---------- fetch (real call → fallback sample)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true); setErr(null);
      try {
        const res = await getIntegrationMap?.();
        let obj = res?.data?.obj ?? null;

        // Fallback sample
        if (!obj) {
          obj = [/* ... (same sample you provided) ... */];
        }

        if (typeof obj === 'string') { try { obj = JSON.parse(obj); } catch {} }
        const wfArr = toWorkflows(obj);
        if (!cancelled) setWorkflows(wfArr);
      } catch (e) {
        if (!cancelled) setErr(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // ---------- draw when workflows available
  useEffect(() => {
    if (!hostRef.current || !workflows.length) return;

    // --- guards / shared state (prevents calling methods after teardown)
    let tornDown = false;
    const cleanupFns = [];
    const timers = [];

    const PortGroup = { IN: 'in', OUT: 'out' };
    const colors = {
      red: '#ed2637',
      black: '#131e29',
      gray: '#dde6ed',
      blue: '#00a0e9',
      white: '#ffffff'
    };

    // Artifact dynamic sizing
    const ARTIFACT_MIN = { width: 220, height: 150 };
    const ARTIFACT_PORT_SPACING = 80;
    const ARTIFACT_VERTICAL_PADDING = 90;
    const calcArtifactHeight = (inCount, outCount) => {
      const portsMax = Math.max(inCount || 0, outCount || 0, 1);
      const sizeFromPorts = ARTIFACT_VERTICAL_PADDING + portsMax * ARTIFACT_PORT_SPACING;
      return Math.max(ARTIFACT_MIN.height, sizeFromPorts);
    };

    // ELEMENT TEMPLATE
    const elementTemplateBase = new shapes.standard.BorderedImage({
      size: { width: 140, height: Math.round(110 * BOX_HEIGHT_SCALE) },
      attrs: {
        root: { magnet: false },
        background: { fill: colors.white },
        border: { rx: 8, ry: 8, stroke: colors.black, strokeWidth: 3 },
        image: {
          x: 'calc(w / 2 - 20)',
          y: 'calc(h / 2 - 20)',
          width: 40,
          height: 40,
          preserveAspectRatio: 'xMidYMid meet',
          opacity: 1
        },
        label: {
          fill: colors.black,
          fontSize: 13,
          fontWeight: '600',
          fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
          textWrap: { width: 'calc(w + 40)', height: null },
          textVerticalAnchor: 'bottom',
          textAnchor: 'middle',
          x: 'calc(w / 2)',
          y: 'calc(h - 6)'
        }
      },
      portMarkup: util.svg/* xml */`
        <g>
          <circle @selector="portHit" r="11" cx="0" cy="0" fill="none" stroke="none" />
          <rect @selector="portBody"
            width="20" height="20" x="-10" y="-10"
            fill="${colors.red}"
            stroke="${colors.gray}" stroke-width="2"
            transform="rotate(45)"
          />
        </g>
      `,
      ports: {
        groups: {
          [PortGroup.IN]:  { position: 'left',  attrs: { portHit: { magnet: 'passive' }, portBody: {} } },
          [PortGroup.OUT]: { position: 'right', attrs: { portHit: { magnet: 'active'  }, portBody: {} } }
        }
      }
    });

    const createElement = (labelText, type = 'workflow') => {
      const el = elementTemplateBase.clone().attr({ label: { text: labelText } });
      const url = ICON_URL[type] || ICON_URL.workflow;
      const size = type === 'workflow' ? 80 : 35;
      el.attr('artifactType', type);
      const { width: w, height: h } = el.size();
      const x = Math.round((w - size) / 2);
      const y = Math.round((h - size) / 2);
      if (url) {
        const resolved = resolvePublic(url);
        el.attr('image/href', resolved);
        el.attr('image/xlinkHref', resolved);
        el.attr('image/width', size);
        el.attr('image/height', size);
        el.attr('image/x', x);
        el.attr('image/y', y);
      }
      return el;
    };

    // LINK TEMPLATE
    const templateLink = new shapes.standard.Link({
      attrs: { line: { stroke: colors.black, strokeWidth: 2 } },
      defaultLabel: {
        markup: util.svg/* xml */`
          <rect @selector="labelBody" />
          <text @selector="labelText" />
        `,
        attrs: {
          root: { cursor: 'pointer' },
          labelText: {
            fill: colors.white,
            fontSize: 24,
            fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
            fontWeight: 'bold',
            textAnchor: 'middle',
            textVerticalAnchor: 'middle',
            textWrap: { width: 180, height: null, ellipsis: true },
            'pointer-events': 'auto'
          },
          labelBody: {
            ref: 'labelText',
            x: 'calc(x - 23)',
            y: 'calc(y - 4)',
            width: 'calc(w + 46)',
            height: 'calc(h + 10)',
            rx: 'calc(h / 2 + 7)',
            ry: 'calc(h / 2 + 7)',
            fill: colors.black,
            stroke: colors.white,
            strokeWidth: 2.5,
            'pointer-events': 'auto'
          }
        }
      }
    });

    // GRAPH + PAPER
    const graph = new dia.Graph({}, { cellNamespace: shapes });
    const paper = new dia.Paper({
      el: hostRef.current,
      model: graph,
      cellViewNamespace: shapes,
      width: hostRef.current.clientWidth || 1000,
      height: hostRef.current.clientHeight || 600,
      gridSize: 20,
      async: true,
      sorting: dia.Paper.sorting.APPROX,
      background: { color: colors.gray },
      linkPinning: false,
      defaultConnector: { name: 'smooth' },
      snapLinks: true,
      interactive: { linkMove: false, labelMove: false },
      defaultConnectionPoint: { name: 'boundary' },
      clickThreshold: 5,
      magnetThreshold: 'onleave',
      markAvailable: true,
      defaultLink: () => templateLink.clone()
    });

    // Guards for teardown
    const safeCall = (fn, ...args) => {
      if (tornDown) return;
      try { fn?.(...args); } catch {}
    };

    function setLinkHighlight(linkModel, on, palette = { blue: '#ed2637', black: '#131e29' }) {
      if (tornDown) return;
      linkModel.attr('line/stroke', on ? palette.blue : palette.black);
      linkModel.attr('line/strokeWidth', on ? 4 : 2);
      try {
        linkModel.prop(['labels', 0, 'attrs', 'labelBody', 'fill'], on ? palette.blue : palette.black);
        linkModel.prop(['labels', 0, 'attrs', 'labelBody', 'stroke'], '#ffffff');
        linkModel.prop(['labels', 0, 'attrs', 'labelText', 'fill'], '#ffffff');
      } catch {}
    }

    const isOverLabel = (evt) =>
      evt?.target?.closest?.('[joint-selector="labelBody"],[joint-selector="labelText"]');

    const onLinkEnter = (linkView, evt) => { if (isOverLabel(evt)) setLinkHighlight(linkView.model, true); };
    const onLinkMove  = (linkView, evt) => setLinkHighlight(linkView.model, !!isOverLabel(evt));
    const onLinkLeave = (linkView) => setLinkHighlight(linkView.model, false);

    paper.on('link:mouseenter', onLinkEnter);
    paper.on('link:mousemove',  onLinkMove);
    paper.on('link:mouseleave', onLinkLeave);
    cleanupFns.push(() => paper.off('link:mouseenter', onLinkEnter));
    cleanupFns.push(() => paper.off('link:mousemove',  onLinkMove));
    cleanupFns.push(() => paper.off('link:mouseleave', onLinkLeave));

    // ----- Zoom + Pan
    let zoom = 1;
    const Z_MIN = 0.4, Z_MAX = 2.0;

    const clientToLocal = (clientX, clientY) => {
      const rect = paper.svg.getBoundingClientRect();
      const pt = paper.svg.createSVGPoint();
      pt.x = clientX - rect.left;
      pt.y = clientY - rect.top;
      return pt.matrixTransform(paper.viewport.getCTM().inverse());
    };

    const onWheel = (evt) => {
      evt.preventDefault();
      if (tornDown) return;
      const raw = evt.deltaY != null ? -evt.deltaY : (evt.wheelDelta != null ? evt.wheelDelta : -evt.detail);
      const step = (raw > 0 ? 1 : -1) * 0.1;
      const newZoom = Math.max(Z_MIN, Math.min(Z_MAX, zoom + step));
      if (newZoom === zoom) return;
      const p = clientToLocal(evt.clientX, evt.clientY);
      safeCall(paper.scale.bind(paper), newZoom, newZoom, p.x, p.y);
      zoom = newZoom;
    };

    paper.svg.addEventListener('wheel', onWheel, { passive: false });
    paper.svg.addEventListener('mousewheel', onWheel, { passive: false });
    paper.svg.addEventListener('DOMMouseScroll', onWheel, { passive: false });
    cleanupFns.push(() => {
      paper.svg.removeEventListener('wheel', onWheel);
      paper.svg.removeEventListener('mousewheel', onWheel);
      paper.svg.removeEventListener('DOMMouseScroll', onWheel);
    });

    let isPanning = false;
    let panStart = null;
    let panOrigin = { tx: 0, ty: 0 };

    const onMouseMove = (e) => {
      if (!isPanning || tornDown) return;
      const dx = e.clientX - panStart.x;
      const dy = e.clientY - panStart.y;
      safeCall(paper.translate.bind(paper), panOrigin.tx + dx, panOrigin.ty + dy);
    };
    const endPan = () => {
      isPanning = false;
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', endPan);
      if (!tornDown) paper.svg.style.cursor = '';
    };

    const onBlankDown = (evt) => {
      isPanning = true;
      panStart = { x: evt.clientX, y: evt.clientY };
      panOrigin = paper.translate();
      if (!tornDown) paper.svg.style.cursor = 'grabbing';
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', endPan);
    };
    paper.on('blank:pointerdown', onBlankDown);
    cleanupFns.push(() => {
      paper.off('blank:pointerdown', onBlankDown);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', endPan);
    });

    // Layout helpers
    const arrangeVerticalWithChains = (
      rows,
      { startY = 120, laneGapY = 240, startX = 220, chainGapX = 360, columnGapX = 440, rowGapY = 44 } = {}
    ) => {
      const metricsOf = (cl) => {
        const aSize = cl.artifactEl.size();
        const aW = aSize.width, aH = aSize.height;
        const leftHeights  = cl.leftEls.map(el => el.size().height);
        const rightHeights = cl.rightEls.map(el => el.size().height);
        const leftTotalH   = leftHeights.reduce((s,h)=>s+h,0)  + Math.max(0, cl.leftEls.length  - 1) * rowGapY;
        const rightTotalH  = rightHeights.reduce((s,h)=>s+h,0) + Math.max(0, cl.rightEls.length - 1) * rowGapY;
        const leftMaxW  = cl.leftEls.reduce((m,el)=>Math.max(m, el.size().width), 0);
        const rightMaxW = cl.rightEls.reduce((m,el)=>Math.max(m, el.size().width), 0);
        const laneHeight = Math.max(aH, leftTotalH, rightTotalH, 1);
        const span = Math.max(
          aW + columnGapX * 2 + leftMaxW + rightMaxW,
          aW + columnGapX * 2 + 280
        );
        return { aW, aH, leftTotalH, rightTotalH, laneHeight, span };
      };

      let currentY = startY;

      rows.forEach((row) => {
        if (!row.length) return;
        const per = row.map(metricsOf);
        const rowHeight = Math.max(...per.map(m => m.laneHeight));
        const laneMidY  = currentY + rowHeight / 2;

        let cx = startX;
        row.forEach((cl, i) => {
          const { aW, aH, leftTotalH, rightTotalH, span } = per[i];

          cl.artifactEl.position(Math.round(cx - aW/2), Math.round(laneMidY - aH/2));

          let leftY = laneMidY - leftTotalH / 2;
          cl.leftEls.forEach(el => {
            const { width: w, height: h } = el.size();
            const x = Math.round(cx - columnGapX - w/2);
            el.position(x, Math.round(leftY));
            leftY += h + rowGapY;
          });

          let rightY = laneMidY - rightTotalH / 2;
          cl.rightEls.forEach(el => {
            const { width: w, height: h } = el.size();
            const x = Math.round(cx + columnGapX - w/2);
            el.position(x, Math.round(rightY));
            rightY += h + rowGapY;
          });

          cx += span + chainGapX;
        });

        currentY += rowHeight + laneGapY;
      });
    };

    const dirOf = (mf) => String(mf?.properties?.direction || '').toLowerCase();

    // Build clusters (elements + ports)
    const clustersRaw = [];
    workflows.forEach((wf) => {
      const participants = Array.isArray(wf.participants) ? wf.participants : [];
      const withFlows = participants.filter(
        p => Array.isArray(p.messageFlows) && p.messageFlows.length > 0
      );

      const senderFlows = [];   // participant -> artifact (OUT)
      const receiverFlows = []; // artifact -> participant (IN)

      const pElMap = new Map();
      const leftEls = [];
      const rightEls = [];

      withFlows.forEach(p => {
        const flows = Array.isArray(p.messageFlows) ? p.messageFlows : [];
        const inToParticipant    = flows.filter(mf => dirOf(mf) === 'receiver');
        const outFromParticipant = flows.filter(mf => dirOf(mf) === 'sender');

        inToParticipant.forEach(mf => receiverFlows.push({ participant: p, mf }));
        outFromParticipant.forEach(mf => senderFlows.push({ participant: p, mf }));

        const type =
          inToParticipant.length > 0
            ? 'receiver'
            : outFromParticipant.length > 0
            ? 'sender'
            : 'workflow';

        const el = createElement(p.name || p.id, type).set('service', p.id);
        const inPorts  = inToParticipant.map((_, i) => ({ group: PortGroup.IN,  id: `in${i + 1}` }));
        const outPorts = outFromParticipant.map((_, i) => ({ group: PortGroup.OUT, id: `out${i + 1}` }));
        el.addPorts([...inPorts, ...outPorts]);

        // Tweak icon + label
        const { width: w, height: h } = el.size();
        const x = Math.round((w - 40) / 2);
        const y = Math.round((h - 40) / 2);
        el.attr('image/width',35)
          .attr('image/height',35)
          .attr('image/x', x)
          .attr('image/y', y)
          .attr('image/preserveAspectRatio', 'xMidYMid meet')
          .attr('image/opacity',1)
          .attr('image/visibility', 'visible')
          .attr('image/pointer-events', 'none')
          .attr('label/fontSize', 24);

        pElMap.set(p.id, { element: el, inCount: inPorts.length, outCount: outPorts.length });

        if (inPorts.length > 0) rightEls.push(el);
        else if (outPorts.length > 0) leftEls.push(el);
      });

      // artifact ports + dynamic height
      const artifactInPorts  = senderFlows.map((_, i) => ({ group: PortGroup.IN,  id: `in${i + 1}` }));
      const artifactOutPorts = receiverFlows.map((_, i) => ({ group: PortGroup.OUT, id: `out${i + 1}` }));
      const dynamicHeight = calcArtifactHeight(artifactInPorts.length, artifactOutPorts.length) * BOX_HEIGHT_SCALE;

      const artifactEl = createElement(wf.artifactName || 'Artifact', 'workflow')
        .set('service', wf.artifactID || (wf.artifactName || 'Artifact'))
        .size({ width: ARTIFACT_MIN.width, height: dynamicHeight })
        .addPorts([...artifactInPorts, ...artifactOutPorts]);

      const { width: aw, height: ah } = artifactEl.size();
      const ax = Math.round((aw - 80) / 2);
      const ay = Math.round((ah - 80) / 2);
      artifactEl
        .attr('image/width',80)
        .attr('image/height',80)
        .attr('image/x', ax)
        .attr('image/y', ay)
        .attr('image/preserveAspectRatio', 'xMidYMid meet')
        .attr('image/opacity',1)
        .attr('image/visibility', 'visible')
        .attr('image/pointer-events', 'none')
        .attr('label/fontSize', 8);

      clustersRaw.push({
        wfId: wf.id,
        artifactEl,
        leftEls,
        rightEls,
        senderFlows,
        receiverFlows,
        pElMap,
        participants
      });
    });

    // === Rule: build cross-artifact order based on channel signatures
    const norm = (v) => String(v ?? '').trim().toLowerCase();
    const typeOf = (mf) => String(mf?.properties?.ComponentType || '').toLowerCase();
    const dirOfLocal  = (mf) => String(mf?.properties?.direction || '').toLowerCase();
    const jmsInKey  = (p) => p?.QueueName_inbound  ?? p?.QueueNameIn  ?? '';
    const jmsOutKey = (p) => p?.QueueName_outbound ?? p?.QueueNameOut ?? '';

    function channelSig(mf, role /* 'out' | 'in' */) {
      const props = mf?.properties || {};
      const t = typeOf(mf);
      if (t === 'jms') {
        if (role === 'out' && props.QueueName_outbound) return `JMS:${norm(jmsOutKey(props))}`;
        if (role === 'in'  && props.QueueName_inbound)  return `JMS:${norm(jmsInKey(props))}`;
      } else if (t === 'processdirect') {
        const addr = props.address || '';
        if (addr) return `ProcessDirect:${norm(addr)}`;
      }
      return '';
    }

    const ids = workflows.map(w => String(w.id || w.artifactID || '').trim());
    const idxOriginal = new Map(ids.map((id,i)=>[id,i]));

    const wfOut = new Map(); // wfId -> Set(sig)
    const wfIn  = new Map(); // wfId -> Set(sig)
    (workflows || []).forEach(wf => {
      const id = String(wf.id || wf.artifactID || '').trim();
      const outs = new Set(), ins = new Set();
      (wf.participants || []).forEach(p => {
        (p.messageFlows || []).forEach(mf => {
          const d = dirOfLocal(mf);
          if (d === 'receiver') { const s = channelSig(mf, 'out'); if (s) outs.add(s); }
          if (d === 'sender')   { const s = channelSig(mf, 'in');  if (s) ins.add(s); }
        });
      });
      wfOut.set(id, outs); wfIn.set(id, ins);
    });

    const edges = new Map(ids.map(id => [id, new Set()]));
    ids.forEach(a => {
      ids.forEach(b => {
        if (a === b) return;
        const aOut = wfOut.get(a) || new Set();
        const bIn  = wfIn.get(b)  || new Set();
        if ([...aOut].some(sig => bIn.has(sig))) edges.get(a).add(b);
      });
    });

    const undirected = new Map(ids.map(id => [id, new Set()]));
    ids.forEach(a => {
      (edges.get(a) || new Set()).forEach(b => { undirected.get(a).add(b); undirected.get(b).add(a); });
    });
    const seenCC = new Set();
    const components = [];
    ids.forEach(id => {
      if (seenCC.has(id)) return;
      const q = [id]; const comp = new Set([id]); seenCC.add(id);
      while (q.length) {
        const u = q.shift();
        (undirected.get(u) || new Set()).forEach(v => {
          if (!seenCC.has(v)) { seenCC.add(v); comp.add(v); q.push(v); }
        });
      }
      components.push(comp);
    });

    function topoOrder(nodesSet) {
      const nodes = [...nodesSet];
      const indeg = new Map(nodes.map(n => [n, 0]));
      nodes.forEach(a => {
        (edges.get(a) || new Set()).forEach(b => { if (nodesSet.has(b)) indeg.set(b, (indeg.get(b) || 0) + 1); });
      });
      const q = nodes.filter(n => (indeg.get(n) || 0) === 0)
                     .sort((a,b) => idxOriginal.get(a) - idxOriginal.get(b));
      const out = [];
      const indegMut = new Map(indeg);
      while (q.length) {
        const n = q.shift();
        out.push(n);
        (edges.get(n) || new Set()).forEach(m => {
          if (!nodesSet.has(m)) return;
          const nv = (indegMut.get(m) || 0) - 1;
          indegMut.set(m, nv);
          if (nv === 0) {
            q.push(m);
            q.sort((a,b) => idxOriginal.get(a) - idxOriginal.get(b));
          }
        });
      }
      if (out.length < nodes.length) nodes.forEach(n => { if (!out.includes(n)) out.push(n); });
      return out;
    }

    const clusterByKey = new Map(
      clustersRaw.map(cl => [String(cl.wfId || cl.artifactEl?.get?.('service') || '').trim(), cl])
    );

    let rows = components
      .map(set => topoOrder(set).map(id => clusterByKey.get(id)).filter(Boolean))
      .filter(row => row.length > 0);

    rows.sort((ra, rb) => {
      const ia = Math.min(...ra.map(cl => idxOriginal.get(String(cl.wfId || cl.artifactEl?.get?.('service') || '').trim()) ?? 1e9));
      const ib = Math.min(...rb.map(cl => idxOriginal.get(String(cl.wfId || cl.artifactEl?.get?.('service') || '').trim()) ?? 1e9));
      return ia - ib;
    });

    const clusters = rows.flat();

    // --- gear button in element
    function addGearToElement(el) {
      if (tornDown) return;
      const view = el.findView(paper);
      if (!view) return;
      if (view.el.querySelector('[joint-selector="gear"]')) return;

      const gearBg  = V('rect',  { 'joint-selector': 'gearBg' });
      const gearImg = V('image', { 'joint-selector': 'gear' });
      const gearHit = V('rect',  { 'joint-selector': 'gearHit' });

      view.vel.append(gearBg); view.vel.append(gearImg); view.vel.append(gearHit);
      gearBg.attr({ x: 4, y: 4, width: 24, height: 24, rx: 6, ry: 6, fill: '#fff', 'pointer-events': 'none' });

      const url = resolvePublic(ICON_URL.gear);
      gearImg.attr({
        x: 7, y: 7, width: 18, height: 18,
        href: url, 'xlink:href': url,
        preserveAspectRatio: 'xMidYMid meet',
        cursor: 'pointer', 'pointer-events': 'auto'
      });
      gearHit.attr({ x: 6, y: 6, width: 20, height: 20, fill: 'transparent', cursor: 'pointer', 'pointer-events': 'auto' });

      const onClick = (evt) => {
        evt.stopPropagation();
        console.log('⚙️ gear clicked:', el.id, el.get('service'));
      };
      gearHit.node.addEventListener('pointerdown', onClick);
      gearImg.node.addEventListener('pointerdown', onClick);

      cleanupFns.push(() => {
        try { gearHit.node.removeEventListener('pointerdown', onClick); } catch {}
        try { gearImg.node.removeEventListener('pointerdown', onClick); } catch {}
      });
    }

    const onGraphAdd = (cell) => { if (cell.isElement()) setTimeout(() => addGearToElement(cell), 0); };
    graph.on('add', onGraphAdd);
    cleanupFns.push(() => graph.off('add', onGraphAdd));

    const onElemDown = (view, evt) => {
      if (evt.target.closest?.('[joint-selector="gear"],[joint-selector="gearHit"]')) {
        evt.stopPropagation();
        const cell = view.model;
        console.log('⚙️ gear clicked:', cell.id, cell.get('service'));
      }
    };
    paper.on('element:pointerdown', onElemDown);
    cleanupFns.push(() => paper.off('element:pointerdown', onElemDown));

    // add elements
    graph.addCells(clusters.flatMap(c => [c.artifactEl, ...c.leftEls, ...c.rightEls]));

    // zoom-to-fit (safe)
    function zoomToFitAll(padding = 40) {
      if (tornDown) return;

      try {
        if (typeof paper.scaleContentToFit === 'function') {
          paper.scale(1, 1);
          paper.translate(0, 0);
          paper.scaleContentToFit({
            padding,
            minScale: Z_MIN,
            maxScale: Z_MAX,
            useModelGeometry: true
          });
          if (typeof paper.centerContent === 'function') {
            paper.centerContent({ useModelGeometry: true });
          }
          const sc = paper.scale();
          zoom = sc.sx || 1;
          return;
        }
      } catch {}

      const rect = hostRef.current?.getBoundingClientRect?.();
      const bb = (paper.getContentBBox && paper.getContentBBox({ useModelGeometry: true }))
              || graph.getBBox(graph.getElements());
      if (!rect || !bb || !bb.width || !bb.height) return;

      const availW = Math.max(1, rect.width  - padding * 2);
      const availH = Math.max(1, rect.height - padding * 2);
      const s = Math.max(Z_MIN, Math.min(Z_MAX, Math.min(availW / bb.width, availH / bb.height)));

      paper.scale(1, 1);
      paper.translate(0, 0);
      paper.scale(s, s, bb.x, bb.y);

      const tx = -bb.x * s + (rect.width  - bb.width  * s) / 2;
      const ty = -bb.y * s + (rect.height - bb.height * s) / 2;
      paper.translate(tx, ty);

      zoom = s;
    }

    // link after render (ensures port geometry is ready)
    const onRenderDone = () => {
      if (tornDown) return;
      graph.getElements().forEach(addGearToElement);

      // defer linking
      const t = setTimeout(() => {
        if (tornDown) return;

        const links = [];

        clusters.forEach((cl) => {
          const { artifactEl, senderFlows, receiverFlows, pElMap } = cl;

          // Sender: participant OUT -> artifact IN
          let artInIdx = 1;
          senderFlows.forEach(({ participant, mf }) => {
            const pi = pElMap.get(participant.id);
            if (!pi) return;
            const label = mf?.properties?.ComponentType;
            const outPortId = `out${Math.min(artInIdx, Math.max(1, pi.outCount))}`;
            const link = templateLink.clone();
            if (label) link.labels([{ attrs: { labelText: { text: label } } }]);
            link.connector('normal');
            links.push(link.set({
              source: { id: pi.element.id, port: outPortId },
              target: { id: artifactEl.id,   port: `in${artInIdx}` },
            }));
            artInIdx += 1;
          });

          // Receiver: artifact OUT -> participant IN
          let artOutIdx = 1;
          receiverFlows.forEach(({ participant, mf }) => {
            const pi = pElMap.get(participant.id);
            if (!pi) return;
            const label = mf?.properties?.ComponentType;
            const inPortId = `in${Math.min(artOutIdx, Math.max(1, pi.inCount))}`;
            const link = templateLink.clone();
            if (label) link.labels([{ attrs: { labelText: { text: label } } }]);
            link.connector('rounded');
            links.push(link.set({
              source: { id: artifactEl.id,   port: `out${artOutIdx}` },
              target: { id: pi.element.id, port: inPortId }
            }));
            artOutIdx += 1;
          });
        });

        graph.addCells(links);

        // ==== CROSS-WORKFLOW VIA PARTICIPANTS (JMS + ProcessDirect)
        const dirX  = (mf) => String(mf?.properties?.direction || '').toLowerCase();
        const typeX = (mf) => String(mf?.properties?.ComponentType || '').toLowerCase();
        const normX = (v) => String(v ?? '').trim().toLowerCase();

        const jmsInKeyX  = (p) => p?.QueueName_inbound  ?? p?.QueueNameIn  ?? p?.QueueName ?? p?.queue ?? '';
        const jmsOutKeyX = (p) => p?.QueueName_outbound ?? p?.QueueNameOut ?? p?.QueueName ?? p?.queue ?? '';

        const channelFor = (mf) => {
          const t = typeX(mf);
          const props = mf?.properties || {};
          if (t === 'jms') {
            return {
              type: 'JMS',
              inKey:  normX(jmsInKeyX(props)),   inRaw:  jmsInKeyX(props),
              outKey: normX(jmsOutKeyX(props)),  outRaw: jmsOutKeyX(props)
            };
          }
          if (t === 'processdirect') {
            const addr = props?.address || '';
            return { type: 'ProcessDirect', inKey: normX(addr), outKey: normX(addr), inRaw: addr, outRaw: addr };
          }
          return null;
        };

        const wfKeyOf = (cl) => {
          const svc = cl?.artifactEl?.get?.('service');
          if (svc) return String(svc).trim();
          if (cl?.wfId) return String(cl.wfId).trim();
          return String(cl?.artifactEl?.id || '').trim();
        };

        const participantsOf = (cl) => {
          if (Array.isArray(cl?.participants)) return cl.participants;
          const key = wfKeyOf(cl);
          const wf = (workflows || []).find(w => String(w.id || w.artifactID || '').trim() === key);
          return Array.isArray(wf?.participants) ? wf.participants : [];
        };

        const sourcesBySig = new Map();
        const targetsBySig = new Map();
        const addSrc = (sig, e) => { if (!sig) return; if (!sourcesBySig.has(sig)) sourcesBySig.set(sig, []); sourcesBySig.get(sig).push(e); };
        const addDst = (sig, e) => { if (!sig) return; if (!targetsBySig.has(sig)) targetsBySig.set(sig, []); targetsBySig.get(sig).push(e); };

        clusters.forEach(cl => {
          const wfKey = wfKeyOf(cl);
          const pById = cl.pElMap;
          if (!pById) return;

          const parts = participantsOf(cl);
          parts.forEach(p => {
            const pi = pById.get(p.id);
            if (!pi) return;

            const flows = Array.isArray(p.messageFlows) ? p.messageFlows : [];
            flows.forEach((mf, idx) => {
              const ch = channelFor(mf);
              if (!ch) return;

              const d = dirX(mf);

              if (d === 'receiver') {
                if (!ch.outKey) return;
                const sig = `${ch.type}:${ch.outKey}`;
                const portId = `xChanOut_${p.id}_${mf.id || idx}`;
                if (!(pi.element.getPorts() || []).some(pp => pp.id === portId)) {
                  pi.element.addPort({ group: 'out', id: portId, channelSig: sig });
                }
                addSrc(sig, { wfKey, pId: p.id, el: pi.element, portId, label: `${ch.type}: ${ch.outRaw}` });
              }

              if (d === 'sender') {
                if (!ch.inKey) return;
                const sig = `${ch.type}:${ch.inKey}`;
                const portId = `xChanIn_${p.id}_${mf.id || idx}`;
                if (!(pi.element.getPorts() || []).some(pp => pp.id === portId)) {
                  pi.element.addPort({ group: 'in', id: portId, channelSig: sig });
                }
                addDst(sig, { wfKey, pId: p.id, el: pi.element, portId, label: `${ch.type}: ${ch.inRaw}` });
              }
            });
          });
        });

        const crossLinks = [];
        const seen = new Set();

        [...sourcesBySig.keys()].forEach(sig => {
          const srcs = sourcesBySig.get(sig) || [];
          const dsts = targetsBySig.get(sig) || [];
          if (!dsts.length) return;

          srcs.forEach(s => {
            dsts.forEach(t => {
              if (s.wfKey && t.wfKey && s.wfKey === t.wfKey) return; // only cross-artifact
              const de = `${s.wfKey}|${s.pId}|${sig}|${t.wfKey}|${t.pId}`;
              if (seen.has(de)) return;
              seen.add(de);

              const link = templateLink.clone();
              link.attr('line/strokeDasharray', '9,4');
              link.attr('line/stroke', '#ed2637');
              link.labels([{ attrs: { labelText: { text: s.label } } }]);
              link.connector('rounded');

              crossLinks.push(link.set({
                source: { id: s.el.id, port: s.portId }, // RIGHT (producer)
                target: { id: t.el.id, port: t.portId }  // LEFT  (consumer)
              }));
            });
          });
        });

        graph.addCells(crossLinks);

        // place elements and fit
        arrangeVerticalWithChains(rows, {
          startY: 120,
          laneGapY: 140,
          startX: 220,
          chainGapX: 30,
          columnGapX: 440,
          rowGapY: 14
        });

        zoomToFitAll(40);
      }, 500);

      timers.push(t);
    };

    paper.once('render:done', onRenderDone);
    cleanupFns.push(() => paper.off('render:done', onRenderDone));

    // add all elements to graph (triggers render)
    graph.addCells(clusters.flatMap(c => [c.artifactEl, ...c.leftEls, ...c.rightEls]));

    // cleanup
    return () => {
      tornDown = true;

      // stop any deferred work
      timers.forEach(id => clearTimeout(id));

      // detach listeners
      cleanupFns.forEach(fn => { try { fn(); } catch {} });

      // remove paper/graph safely
      try { paper.remove(); } catch {}
      try { graph.clear(); } catch {}
    };
  }, [workflows]);

  if (loading) return <div style={{ padding: 12 }}>Loading…</div>;
  if (err) return <div style={{ padding: 12, color: 'crimson' }}>Error: {String(err)}</div>;
  if (!workflows.length) return <div style={{ padding: 12 }}>No data.</div>;

  return (
    <div
      ref={hostRef}
      className="graphcontainer"
      style={{
        width: '100%',
        height: 600, 
        overflow: 'auto',
        border: '1px solid #c9d6e2',
        borderRadius: 8,
        background: '#dde6ed'
      }}
    />
  );
}
