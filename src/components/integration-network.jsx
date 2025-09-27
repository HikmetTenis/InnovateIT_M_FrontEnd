// src/components/IntegrationNetwork.jsx
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { dia, shapes } from '@joint/core';
import { DirectedGraph } from '@joint/layout-directed-graph';
import { BusyIndicator, MessageStrip } from '@ui5/webcomponents-react';
import { getIntegrationMap } from '../services/s-integration-network';

/* --------------------------- helpers --------------------------- */
const norm = (s) => (s ?? '').toString().trim().toLowerCase().replace(/\s+/g, '').replace(/\/+$/, '');
const isReceiver = (f) => String(f?.properties?.direction || '').toLowerCase() === 'receiver';
const isSender   = (f) => String(f?.properties?.direction || '').toLowerCase() === 'sender';

const hasParticipantsArray = (x) => x && typeof x === 'object' && Array.isArray(x.participants);
const looksLikeParticipant = (x) => x && typeof x === 'object' && 'artifactID' in x && 'artifactName' in x && 'name' in x;

function toWorkflows(anyPayload) {
  if (Array.isArray(anyPayload) && anyPayload.some(hasParticipantsArray)) return anyPayload;

  // collect participant-like nodes and group by artifact
  const participants = [];
  const visit = (node) => {
    if (typeof node === 'string') { try { visit(JSON.parse(node)); } catch {} return; }
    if (Array.isArray(node)) { node.forEach(visit); return; }
    if (node && typeof node === 'object') {
      if (looksLikeParticipant(node)) { participants.push(node); return; }
      Object.values(node).forEach(visit);
    }
  };
  visit(anyPayload);

  const byArtifact = new Map();
  participants.forEach((p) => {
    const key = `${p.artifactID}•${p.artifactName}`;
    if (!byArtifact.has(key)) {
      byArtifact.set(key, {
        id: p.artifactID,
        artifactID: p.artifactID,
        artifactName: p.artifactName,
        artifactVersion: p.artifactVersion,
        packageID: p.packageID,
        packageName: p.packageName,
        participants: []
      });
    }
    byArtifact.get(key).participants.push({
      id: p.id, name: p.name,
      messageFlows: Array.isArray(p.messageFlows) ? p.messageFlows : []
    });
  });
  return [...byArtifact.values()];
}

const wfKey = (wf) => `${wf.artifactID}•${wf.artifactName}`;
const pKey  = (wf, p) => `${wfKey(wf)}|${p.id || p.name}`;

/* -------------------------- sizing --------------------------- */
const PARENT_W = 560;
const HDR_H = 36;
const PAD = 16;
const ROW_H = 32;

/* --------------------------- component --------------------------- */
export default function IntegrationNetwork() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [workflows, setWorkflows] = useState([]);

  const hostRef   = useRef(null);
  const graphRef  = useRef(null);
  const paperRef  = useRef(null);
  const roRef     = useRef(null);
  const rafRef    = useRef(0);
  const initedRef = useRef(false);
  const lastSize  = useRef({ w: 0, h: 0 });

  // fetch data here
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true); setErr(null);
      try {
        // const res = await getIntegrationMap();
        // let obj = res?.data?.obj ?? [];
        let obj = [{
        "id": "_45ec2369b71df7a683452e21be2f8fd1",
        "packageID": "IIT",
        "packageName": "IIT",
        "artifactID": "_45ec2369b71df7a683452e21be2f8fd1",
        "artifactName": "MON_Mixed_APIs_147",
        "artifactVersion": "Active",
        "participants": [
            {
                "id": "Participant_99848",
                "name": "Sender1",
                "messageFlows": []
            },
            {
                "id": "Participant_99857",
                "name": "Sender2",
                "messageFlows": []
            },
            {
                "id": "Participant_2",
                "name": "Receiver",
                "messageFlows": [
                    {
                        "id": "MessageFlow_22",
                        "properties": {
                            "Description": "",
                            "methodSourceExpression": "",
                            "ComponentNS": "sap",
                            "privateKeyAlias": "",
                            "httpMethod": "POST",
                            "allowedResponseHeaders": "*",
                            "Name": "HTTP",
                            "TransportProtocolVersion": "1.15.0",
                            "ComponentSWCVName": "external",
                            "proxyPort": "",
                            "enableMPLAttachments": "true",
                            "httpAddressQuery": "",
                            "httpRequestTimeout": "60000",
                            "MessageProtocol": "None",
                            "ComponentSWCVId": "1.15.0",
                            "allowedRequestHeaders": "",
                            "direction": "Receiver",
                            "ComponentType": "HTTP",
                            "httpShouldSendBody": "false",
                            "throwExceptionOnFailure": "true",
                            "proxyType": "default",
                            "componentVersion": "1.15",
                            "retryIteration": "1",
                            "proxyHost": "",
                            "retryOnConnectionFailure": "false",
                            "system": "Receiver",
                            "authenticationMethod": "None",
                            "locationID": "",
                            "retryInterval": "5",
                            "TransportProtocol": "HTTP",
                            "cmdVariantUri": "ctype::AdapterVariant/cname::sap:HTTP/tp::HTTP/mp::None/direction::Receiver/version::1.15.0",
                            "credentialName": "",
                            "httpErrorResponseCodes": "",
                            "MessageProtocolVersion": "1.15.0",
                            "httpAddressWithoutQuery": "https://api.restful-api.dev/objects"
                        }
                    }
                ]
            },
            {
                "id": "Participant_7",
                "name": "Receiver1",
                "messageFlows": [
                    {
                        "id": "MessageFlow_8",
                        "properties": {
                            "Description": "",
                            "methodSourceExpression": "",
                            "ComponentNS": "sap",
                            "privateKeyAlias": "",
                            "httpMethod": "GET",
                            "allowedResponseHeaders": "*",
                            "Name": "HTTP",
                            "TransportProtocolVersion": "1.15.0",
                            "ComponentSWCVName": "external",
                            "proxyPort": "",
                            "enableMPLAttachments": "true",
                            "httpAddressQuery": "",
                            "httpRequestTimeout": "60000",
                            "MessageProtocol": "None",
                            "ComponentSWCVId": "1.15.0",
                            "allowedRequestHeaders": "",
                            "direction": "Receiver",
                            "ComponentType": "HTTP",
                            "httpShouldSendBody": "false",
                            "throwExceptionOnFailure": "true",
                            "proxyType": "default",
                            "componentVersion": "1.15",
                            "retryIteration": "1",
                            "proxyHost": "",
                            "retryOnConnectionFailure": "false",
                            "system": "Receiver1",
                            "authenticationMethod": "None",
                            "locationID": "",
                            "retryInterval": "5",
                            "TransportProtocol": "HTTP",
                            "cmdVariantUri": "ctype::AdapterVariant/cname::sap:HTTP/tp::HTTP/mp::None/direction::Receiver/version::1.15.0",
                            "credentialName": "",
                            "httpErrorResponseCodes": "",
                            "MessageProtocolVersion": "1.15.0",
                            "httpAddressWithoutQuery": "https://dsfdsfs.nindasdja/fact"
                        }
                    }
                ]
            },
            {
                "id": "Participant_13",
                "name": "Receiver2",
                "messageFlows": [
                    {
                        "id": "MessageFlow_14",
                        "properties": {
                            "Description": "",
                            "methodSourceExpression": "",
                            "ComponentNS": "sap",
                            "privateKeyAlias": "",
                            "httpMethod": "GET",
                            "allowedResponseHeaders": "*",
                            "Name": "HTTP",
                            "TransportProtocolVersion": "1.15.0",
                            "ComponentSWCVName": "external",
                            "proxyPort": "",
                            "enableMPLAttachments": "true",
                            "httpAddressQuery": "",
                            "httpRequestTimeout": "60000",
                            "MessageProtocol": "None",
                            "ComponentSWCVId": "1.15.0",
                            "allowedRequestHeaders": "",
                            "direction": "Receiver",
                            "ComponentType": "HTTP",
                            "httpShouldSendBody": "false",
                            "throwExceptionOnFailure": "true",
                            "proxyType": "default",
                            "componentVersion": "1.15",
                            "retryIteration": "1",
                            "proxyHost": "",
                            "retryOnConnectionFailure": "false",
                            "system": "Receiver2",
                            "authenticationMethod": "None",
                            "locationID": "",
                            "retryInterval": "5",
                            "TransportProtocol": "HTTP",
                            "cmdVariantUri": "ctype::AdapterVariant/cname::sap:HTTP/tp::HTTP/mp::None/direction::Receiver/version::1.15.0",
                            "credentialName": "",
                            "httpErrorResponseCodes": "",
                            "MessageProtocolVersion": "1.15.0",
                            "httpAddressWithoutQuery": "https://api.coindesk.com/v1/bp1i/currentprice.json"
                        }
                    }
                ]
            }
        ]
    }]
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

  const beginFreeze = (paper, graph) => {
    if (paper?.freeze && paper?.unfreeze) { paper.freeze(); return () => paper.unfreeze(); }
    if (graph?.startBatch && graph?.stopBatch) { graph.startBatch('layout'); return () => graph.stopBatch('layout'); }
    return () => {};
  };

  // Dagre layout on workflow parents; safe with fallback grid
  const layoutParents = useCallback((parents, guides) => {
    const graph = graphRef.current;
    const paper = paperRef.current;
    if (!graph || !paper) return;

    if (!Array.isArray(parents) || parents.length === 0) {
      paper.fitToContent?.({ padding: 20, allowNewOrigin: 'any' }) ||
      paper.scaleContentToFit?.({ padding: 20 });
      return;
    }

    const gridFallback = () => {
      const GAP_X = 160, GAP_Y = 120;
      const cols = Math.max(1, Math.ceil(Math.sqrt(parents.length)));
      parents.forEach((p, i) => {
        const col = i % cols, row = Math.floor(i / cols);
        const { width: w = 400, height: h = 250 } = p.size?.() || {};
        p.position?.(60 + col * (w + GAP_X), 60 + row * (h + GAP_Y));
      });
    };

    const unfreeze = beginFreeze(paper, graph);
    try {
      const parentIds = new Set(parents.map((p) => p.id));
      const safeGuides = (Array.isArray(guides) ? guides : []).filter((l) => {
        const s = l.get('source')?.id, t = l.get('target')?.id;
        return s && t && parentIds.has(s) && parentIds.has(t);
      });

      // Extra spacing so participants placed outside the parent don’t collide
      DirectedGraph.layout([...parents, ...safeGuides], {
        rankDir: 'LR',
        nodeSep: 240,   // wider horizontal spacing between parents
        edgeSep: 40,
        rankSep: 260,   // more vertical spacing between rows
        marginX: 60,
        marginY: 60
      });
    } catch {
      gridFallback();
    } finally {
      unfreeze();
    }

    paper.fitToContent?.({ padding: 40, allowNewOrigin: 'any' }) ||
    paper.scaleContentToFit?.({ padding: 40 });
  }, []);

  // draw
  useEffect(() => {
    const host = hostRef.current;
    if (!host || loading || err) return;

    const visibleAndSized = () => {
      const r = host.getBoundingClientRect();
      const cs = getComputedStyle(host);
      return r.width >= 50 && r.height >= 50 && cs.display !== 'none' && cs.visibility !== 'hidden';
    };

    const init = () => {
      if (initedRef.current) return;
      initedRef.current = true;

      const graph = new dia.Graph({}, { cellNamespace: shapes });
      const w0 = Math.max(1000, host.clientWidth || 1200);
      const h0 = Math.max(700, host.clientHeight || 800);

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

      const parents = [];
      const childByPK = new Map();       // pKey -> participant element
      const pkToWf   = new Map();        // pKey -> wfKey
      const graphCells = [];
      const parentGuides = [];

      const quickNameIndex     = new Map(); // name -> Set(pKey)
      const quickEndpointIndex = new Map(); // url  -> Set(pKey)

      const safeWfs = Array.isArray(workflows) ? workflows : [];

      // 1) parents + children; internal links attach to parent ports
      safeWfs.forEach((wf) => {
        const parts = Array.isArray(wf.participants) ? wf.participants : [];
        const relevant = parts.filter((p) => Array.isArray(p.messageFlows) && p.messageFlows.length > 0);

        const inbound  = [];
        const outbound = [];

        relevant.forEach((p) => {
          const flows = p.messageFlows || [];
          if (flows.some(isSender))   inbound.push(p);
          if (flows.some(isReceiver)) outbound.push(p);

          const n = norm(p.name);
          if (n) { if (!quickNameIndex.has(n)) quickNameIndex.set(n, new Set()); quickNameIndex.get(n).add(pKey(wf, p)); }
          flows.forEach((mf) => {
            const url = norm(mf?.properties?.httpAddressWithoutQuery);
            if (!url) return;
            const pk = pKey(wf, p);
            if (!quickEndpointIndex.has(url)) quickEndpointIndex.set(url, new Set());
            quickEndpointIndex.get(url).add(pk);
          });
        });

        const rows = Math.max(1, Math.max(inbound.length, outbound.length));
        const PARENT_H = HDR_H + PAD * 2 + rows * ROW_H;

        // parent (artifact) with ports
        const parent = new shapes.standard.Rectangle({
          size: { width: PARENT_W, height: PARENT_H },
          position: { x: 0, y: 0 },
          attrs: {
            body: { fill: '#F9FAFB', stroke: '#D1D5DB', strokeWidth: 2, rx: 10, ry: 10 },
            label: {
              text: `${wf.artifactName || wf.id || 'Workflow'} • ${wf.artifactID || ''}${wf.artifactVersion ? ` • v:${wf.artifactVersion}` : ''}`,
              refY: 10, yAlignment: 'top',
              fontFamily: 'Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif',
              fontSize: 12, fontWeight: 'bold', fill: '#111827'
            }
          }
        });

        parent.addPorts([{ id: 'in', group: 'in' }, { id: 'out', group: 'out' }]);
        parent.set('ports', {
          ...parent.get('ports'),
          groups: {
            in:  { position: 'left',  attrs: { circle: { r: 4, magnet: true, fill: '#2563EB' } }, markup: [{ tagName: 'circle', selector: 'circle' }] },
            out: { position: 'right', attrs: { circle: { r: 4, magnet: true, fill: '#16A34A' } }, markup: [{ tagName: 'circle', selector: 'circle' }] }
          }
        });

        parents.push(parent);
        graphCells.push(parent);

        const NODE_W = 240, NODE_H = 24, GAP_SIDE = 40;

        const makeChild = (p, idx, lane) => {
          const y0 = parent.position().y + HDR_H + PAD;
          const y  = y0 + idx * ROW_H + ROW_H / 2 - NODE_H / 2;
          const x = lane === 'in'
            ? parent.position().x - GAP_SIDE - NODE_W  // left of parent
            : parent.position().x + PARENT_W + GAP_SIDE; // right of parent

          const el = new shapes.standard.Rectangle({
            size: { width: NODE_W, height: NODE_H },
            position: { x, y },
            attrs: {
              body: {
                fill: '#FFFFFF',
                stroke: lane === 'in' ? '#2563EB' : '#16A34A',
                strokeWidth: 2, rx: 6, ry: 6
              },
              label: { text: p.name, fontSize: 11, fill: '#111827' }
            }
          });

          // IMPORTANT: embed so they move with the parent after Dagre
          parent.embed(el);

          graphCells.push(el);
          const pk = pKey(wf, p);
          childByPK.set(pk, el);
          pkToWf.set(pk, wfKey(wf));

          // internal link: participant ↔ parent port
          const flows = p.messageFlows || [];
          const labelText = flows
            .filter(isReceiver) // outbound labels
            .map(f => `${f?.properties?.httpMethod || ''} ${f?.properties?.httpAddressWithoutQuery || ''}`.trim())
            .filter(Boolean)
            .join('\n');

          const labels = labelText ? [{
            position: 0.5,
            attrs: {
              label: { text: labelText, fontSize: 10, fill: '#374151' },
              body:  { fill: '#F3F4F6', stroke: '#E5E7EB' }
            }
          }] : [];

          const link = lane === 'in'
            ? new shapes.standard.Link({ source: { id: el.id }, target: { id: parent.id, port: 'in'  }, labels })
            : new shapes.standard.Link({ source: { id: parent.id, port: 'out' }, target: { id: el.id },           labels });

          link.attr({
            line: {
              stroke: '#6B7280', strokeWidth: 2,
              targetMarker: { type: 'path', d: 'M 10 -5 0 0 10 5 z' }
            }
          });

          // Manhattan routing to avoid overlaps
          link.router({ name: 'manhattan', args: { padding: 18, step: 12 } }).connector('rounded');
          graphCells.push(link);
        };

        inbound.forEach((p, i)  => makeChild(p, i, 'in'));
        outbound.forEach((p, i) => makeChild(p, i, 'out'));
      });

      // 2) cross-workflow links (participant -> participant), with guards
      const made = new Set();
      const addCross = (fromPk, toPk, label) => {
        if (!fromPk || !toPk) return;
        if (fromPk === toPk) return;                                   // no self loops
        if (pkToWf.get(fromPk) === pkToWf.get(toPk)) return;           // no same-workflow loops

        const src = childByPK.get(fromPk);
        const trg = childByPK.get(toPk);
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
        link.router({ name: 'manhattan', args: { padding: 20, step: 12 } }).connector('rounded');
        graphCells.push(link);
      };

      // A) outbound.system -> other participant.name
      (Array.isArray(workflows) ? workflows : []).forEach((wf) => {
        (wf.participants || []).forEach((p) => {
          const flows = p.messageFlows || [];
          if (!flows.some(isReceiver)) return; // outbound only initiates
          const fromPk = pKey(wf, p);
          flows.forEach((mf) => {
            const sys = norm(mf?.properties?.system);
            if (!sys) return;
            const targets = [...(quickNameIndex.get(sys) || [])];
            targets.forEach((toPk) => addCross(fromPk, toPk, mf?.properties?.Name || 'direct'));
          });
        });
      });

      // B) identical endpoint (across workflows)
      quickEndpointIndex.forEach((set) => {
        const arr = [...set];
        if (arr.length < 2) return;
        for (let i = 0; i < arr.length - 1; i++) {
          for (let j = i + 1; j < arr.length; j++) {
            addCross(arr[i], arr[j], 'direct(endpoint)');
          }
        }
      });

      // add and layout
      graph.addCells(graphCells);
      layoutParents(parents, parentGuides);

      // Resize handling
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
          paper.scaleContentToFit?.({ padding: 40 });
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
  }, [workflows, loading, err, layoutParents]);

  if (loading) return <BusyIndicator active style={{ width: '100%', height: '100%' }} size="M" />;
  if (err) {
    return (
      <MessageStrip design="Negative" style={{ margin: 12 }}>
        Failed to load integration map: {String(err?.message || err)}
      </MessageStrip>
    );
  }

  return (
    <div className='graphcontainer'
      ref={hostRef}
      style={{ width: '100%', height: '100%', minHeight: 600, position: 'relative' }}
    />
  );
}
