import React, { useEffect, useRef, useCallback } from 'react';
import { dia, shapes } from '@joint/core';
import { DirectedGraph } from '@joint/layout-directed-graph';

/* --------------------------- utilities --------------------------- */

const isReceiverFlow = (f) =>
  String(f?.properties?.direction || '').toLowerCase() === 'receiver';
const isSenderFlow = (f) =>
  String(f?.properties?.direction || '').toLowerCase() === 'sender';

const normalize = (s) =>
  (s ?? '').toString().trim().toLowerCase().replace(/\s+/g, '').replace(/\/+$/, '');

const isParticipant = (x) =>
  x && typeof x === 'object' && 'artifactID' in x && 'artifactName' in x && 'name' in x;

/** robust collector: handles array-of-arrays, single array, nested objects, stringified JSON */
function collectParticipants(anyPayload) {
  const out = [];
  const visit = (node) => {
    if (typeof node === 'string') {
      try { visit(JSON.parse(node)); } catch { /* ignore */ }
      return;
    }
    if (Array.isArray(node)) { node.forEach(visit); return; }
    if (node && typeof node === 'object') {
      if (isParticipant(node)) { out.push(node); return; }
      Object.values(node).forEach(visit);
    }
  };
  visit(anyPayload);
  return out;
}

const wfKey = (p) => `${p.artifactID}•${p.artifactName}`;
const nodeKey = (p) => `${p.artifactID}|${p.artifactName}|${p.name}`;

/** infer participant role in the workflow */
function classifyParticipant(p) {
  const flows = p.messageFlows || [];
  if (flows.length === 0) return 'inbound';           // no adapter configured → treated as sender into the flow
  if (flows.some(isReceiverFlow)) return 'outbound';  // CPI "Receiver" adapter → outbound from the flow
  if (flows.some(isSenderFlow)) return 'inbound';     // CPI "Sender" adapter → inbound to the flow
  return 'neutral';
}

/* ---------------------- layout constants ------------------------- */

const PARENT_WIDTH = 380;
const HEADER_H = 36;
const PAD = 16;
const ROW_H = 32;
const CORE_W = 120;
const CORE_H = 40;

/* ------------------------- diagram build ------------------------- */

function buildWorkflowsGraph(payload) {
  const participants = collectParticipants(payload);

  // group participants by workflow (artifactID + artifactName)
  const workflows = new Map(); // wfKey -> { artifactID, artifactName, version, participants[] }
  for (const p of participants) {
    const k = wfKey(p);
    if (!workflows.has(k)) workflows.set(k, {
      artifactID: p.artifactID,
      artifactName: p.artifactName,
      artifactVersion: p.artifactVersion,
      participants: []
    });
    workflows.get(k).participants.push(p);
  }

  // indexes for cross-workflow matching
  const byName = new Map();     // normalized participant name -> Set(nodeKey)
  const byEndpoint = new Map(); // normalized endpoint -> Set(nodeKey)

  const graphCells = [];
  const parentByWf = new Map();   // wfKey -> parent element
  const childByKey = new Map();   // nodeKey -> child element
  const coreByWf = new Map();     // wfKey -> core element (inside parent)
  const parentGuideLinks = [];    // hidden parent-to-parent links to guide layout
  const crossLinks = [];          // actual child-to-child cross-workflow links

  // 1) build parent containers with embedded children + core
  for (const [k, wf] of workflows) {
    const inbound = [];
    const outbound = [];
    const neutral = [];

    wf.participants.forEach((p) => {
      const role = classifyParticipant(p);
      if (role === 'inbound') inbound.push(p);
      else if (role === 'outbound') outbound.push(p);
      else neutral.push(p);
    });

    // compute parent height from max lane length
    const maxRows = Math.max(inbound.length, outbound.length, 1);
    const parentHeight = HEADER_H + PAD * 2 + Math.max(maxRows, 2) * ROW_H;

    // parent (workflow container)
    const parent = new shapes.standard.Rectangle({
      size: { width: PARENT_WIDTH, height: parentHeight },
      position: { x: 0, y: 0 },
      attrs: {
        body: { fill: '#F9FAFB', stroke: '#D1D5DB', strokeWidth: 2, rx: 10, ry: 10 },
        label: {
          text: `${wf.artifactName} • ${wf.artifactID}${wf.artifactVersion ? ` • v:${wf.artifactVersion}` : ''}`,
          refY: 10, yAlignment: 'top',
          fontFamily: 'Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif',
          fontSize: 12, fontWeight: 'bold', fill: '#111827'
        }
      }
    });

    // core node in the middle (represents the iFlow logic)
    const core = new shapes.standard.Rectangle({
      size: { width: CORE_W, height: CORE_H },
      position: {
        x: parent.position().x + (PARENT_WIDTH - CORE_W) / 2,
        y: parent.position().y + HEADER_H + (parentHeight - HEADER_H) / 2 - CORE_H / 2
      },
      attrs: {
        body: { fill: '#FFFFFF', stroke: '#6B7280', strokeWidth: 2, rx: 6, ry: 6 },
        label: { text: 'Workflow', fontSize: 12, fill: '#111827' }
      }
    });

    parentByWf.set(k, parent);
    coreByWf.set(k, core);

    graphCells.push(parent, core);
    parent.embed(core); // make it move with the parent

    // child participant element factory
    const makeChild = (p, idx, lane, totalInLane) => {
      const yStart = parent.position().y + HEADER_H + PAD;
      const y = yStart + idx * ROW_H + ROW_H / 2 - 12;

      const isInbound = lane === 'in';
      const x = isInbound
        ? parent.position().x + PAD
        : parent.position().x + PARENT_WIDTH - PAD - 180;

      const el = new shapes.standard.Rectangle({
        size: { width: 180, height: 24 },
        position: { x, y },
        attrs: {
          body: { fill: '#FFFFFF', stroke: isInbound ? '#2563EB' : '#16A34A', strokeWidth: 2, rx: 5, ry: 5 },
          label: { text: p.name, fontSize: 11, fill: '#111827' }
        }
      });

      // tiny port circles (optional)
      el.addPorts([
        { id: `${nodeKey(p)}-in`, group: 'in' },
        { id: `${nodeKey(p)}-out`, group: 'out' }
      ]);
      el.set('ports', {
        ...el.get('ports'),
        groups: {
          in:  { position: 'left',  attrs: { circle: { r: 3, magnet: 'passive', fill: '#2563EB' } }, markup: [{ tagName: 'circle', selector: 'circle' }] },
          out: { position: 'right', attrs: { circle: { r: 3, magnet: 'active',  fill: '#16A34A' } }, markup: [{ tagName: 'circle', selector: 'circle' }] }
        }
      });

      // embed into parent so it moves together
      parent.embed(el);
      graphCells.push(el);
      childByKey.set(nodeKey(p), el);

      // index for cross-workflow matching
      const n = normalize(p.name);
      if (n) {
        if (!byName.has(n)) byName.set(n, new Set());
        byName.get(n).add(nodeKey(p));
      }
      (p.messageFlows || []).forEach((mf) => {
        const url = normalize(mf?.properties?.httpAddressWithoutQuery);
        if (url) {
          if (!byEndpoint.has(url)) byEndpoint.set(url, new Set());
          byEndpoint.get(url).add(nodeKey(p));
        }
      });

      // connect to core internally (inbound -> core, core -> outbound)
      const labelText = (p.messageFlows || [])
        .filter(isReceiverFlow) // only show method/url for receiver adapters (outbound)
        .map((f) => `${f?.properties?.httpMethod || ''} ${f?.properties?.httpAddressWithoutQuery || ''}`.trim())
        .filter(Boolean)
        .join('\n');

      const mkLabel = labelText ? [{
        position: 0.5,
        attrs: {
          label: { text: labelText, fontSize: 10, fill: '#374151' },
          body:  { fill: '#F3F4F6', stroke: '#E5E7EB' }
        }
      }] : [];

      const link = isInbound
        ? new shapes.standard.Link({ source: { id: el.id }, target: { id: core.id }, labels: [] })
        : new shapes.standard.Link({ source: { id: core.id }, target: { id: el.id }, labels: mkLabel });

      link.attr({
        line: {
          stroke: '#6B7280', strokeWidth: 2,
          targetMarker: { type: 'path', d: 'M 10 -5 0 0 10 5 z' }
        }
      });
      link.router('orthogonal').connector('rounded');
      graphCells.push(link);
    };

    inbound.forEach((p, i)  => makeChild(p, i, 'in',  inbound.length));
    outbound.forEach((p, i) => makeChild(p, i, 'out', outbound.length));
    neutral.forEach((p, i)  => makeChild(p, i, 'in',  neutral.length)); // place neutrals on left by default
  }

  // 2) cross-workflow links via participants (direct calls)
  //    - by system name (outbound participant's flow 'system' => another participant 'name')
  //    - by identical endpoint URL (httpAddressWithoutQuery)
  const made = new Set();
  const addCross = (fromK, toK, label) => {
    if (fromK === toK) return;
    const src = childByKey.get(fromK);
    const trg = childByKey.get(toK);
    if (!src || !trg) return;
    const sig = `${src.id}->${trg.id}`;
    if (made.has(sig)) return;
    made.add(sig);

    const link = new shapes.standard.Link({
      source: { id: src.id },
      target: { id: trg.id },
      labels: label ? [{
        position: 0.5,
        attrs: {
          label: { text: label, fontSize: 10, fill: '#111827' },
          body:  { fill: '#FEF3C7', stroke: '#F59E0B' }
        }
      }] : []
    });
    link.attr({
      line: {
        stroke: '#F59E0B', strokeWidth: 2,
        targetMarker: { type: 'path', d: 'M 10 -5 0 0 10 5 z' }
      }
    });
    link.router('orthogonal').connector('rounded');
    crossLinks.push(link);
    graphCells.push(link);

    // also add hidden parent guide link for layout
    const parentA = [...parentByWf.values()].find((pe) => pe.getEmbeddedCells().some((c) => c.id === src.id));
    const parentB = [...parentByWf.values()].find((pe) => pe.getEmbeddedCells().some((c) => c.id === trg.id));
    if (parentA && parentB && parentA.id !== parentB.id) {
      const guide = new shapes.standard.Link({
        source: { id: parentA.id }, target: { id: parentB.id },
        attrs: { line: { stroke: '#000', strokeOpacity: 0, strokeWidth: 0 } } // invisible
      });
      parentGuideLinks.push(guide);
      graphCells.push(guide);
    }
  };

  // by system name
  participants.forEach((p) => {
    const fromK = nodeKey(p);
    (p.messageFlows || []).forEach((mf) => {
      if (!isReceiverFlow(mf)) return; // outbound side of a flow triggers “direct”
      const sys = normalize(mf?.properties?.system);
      if (!sys || !byName.has(sys)) return;
      byName.get(sys).forEach((toK) => addCross(fromK, toK, mf?.properties?.Name || 'direct'));
    });
  });

  // by identical endpoint (less common for inbound, but supported)
  byEndpoint.forEach((set) => {
    const arr = [...set];
    if (arr.length < 2) return;
    for (let i = 0; i < arr.length - 1; i++) {
      for (let j = i + 1; j < arr.length; j++) {
        addCross(arr[i], arr[j], 'direct(endpoint)');
      }
    }
  });

  return { graphCells, parents: [...parentByWf.values()], parentGuideLinks };
}

/* ------------------------- React wrapper ------------------------- */

export default function WorkflowDiagram({ data }) {
  const hostRef   = useRef(null);
  const graphRef  = useRef(null);
  const paperRef  = useRef(null);
  const roRef     = useRef(null);
  const rafRef    = useRef(0);
  const initedRef = useRef(false);
  const lastSize  = useRef({ w: 0, h: 0 });

  const beginFreeze = (paper, graph) => {
    if (paper?.freeze && paper?.unfreeze) { paper.freeze(); return () => paper.unfreeze(); }
    if (graph?.startBatch && graph?.stopBatch) { graph.startBatch('layout'); return () => graph.stopBatch('layout'); }
    return () => {};
  };

  const layoutParents = useCallback((parents, guides) => {
    const graph = graphRef.current;
    const paper = paperRef.current;
    if (!graph || !paper) return;

    const unfreeze = beginFreeze(paper, graph);
    try {
      // run Dagre on parents + guide links only (children are embedded and will ride along)
      DirectedGraph.layout([...parents, ...guides], {
        rankDir: 'LR',
        nodeSep: 80,
        edgeSep: 40,
        rankSep: 140,
        marginX: 30,
        marginY: 30
      });
    } finally { unfreeze(); }

    paper.fitToContent?.({ padding: 20, allowNewOrigin: 'any' }) ||
    paper.scaleContentToFit?.({ padding: 20 });
  }, []);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const visibleAndSized = () => {
      const r = host.getBoundingClientRect();
      const cs = getComputedStyle(host);
      return r.width >= 50 && r.height >= 50 && cs.display !== 'none' && cs.visibility !== 'hidden';
    };

    const init = () => {
      if (initedRef.current) return;
      initedRef.current = true;

      const graph = new dia.Graph({}, { cellNamespace: shapes });
      const w0 = Math.max(600, host.clientWidth || 900);
      const h0 = Math.max(520, host.clientHeight || 600);

      const paper = new dia.Paper({
        el: host,
        model: graph,
        width: w0,
        height: h0,
        background: { color: '#F5F5F5' },
        cellViewNamespace: shapes,
        async: true
      });

      graphRef.current = graph;
      paperRef.current = paper;
      lastSize.current = { w: w0, h: h0 };

      // Build full diagram
      const { graphCells, parents, parentGuideLinks } = buildWorkflowsGraph(data);
      graph.addCells(graphCells);

      // Auto-arrange (parents only, children embedded)
      layoutParents(parents, parentGuideLinks);

      // Resize observer on parent container
      const observed = host.parentElement || host;
      const ro = new ResizeObserver(() => {
        const w = Math.round(observed.clientWidth || host.clientWidth || 0);
        const h = Math.round(observed.clientHeight || host.clientHeight || 0);
        if (w < 50 || h < 50) return;
        if (w === lastSize.current.w && h === lastSize.current.h) return;
        lastSize.current = { w, h };
        cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(() => {
          paper.setDimensions(w, h);
          paper.scaleContentToFit?.({ padding: 20 });
        });
      });
      ro.observe(observed);
      roRef.current = ro;
    };

    const boot = () => (visibleAndSized() ? init() : (rafRef.current = requestAnimationFrame(boot)));
    rafRef.current = requestAnimationFrame(boot);

    return () => {
      cancelAnimationFrame(rafRef.current);
      try { roRef.current?.disconnect(); } catch {}
      try { paperRef.current?.remove(); } catch {}
      try { graphRef.current?.clear(); } catch {}
      roRef.current = null; paperRef.current = null; graphRef.current = null; initedRef.current = false;
    };
  }, [data, layoutParents]);

  return (
    <div className=''
      ref={hostRef}
      style={{ width: '100%', height: '100%', minHeight: 560, position: 'relative' }}
    />
  );
}
