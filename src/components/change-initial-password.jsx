// src/components/integration-network.jsx
import React, { useEffect, useRef, useState } from 'react';
import { dia, shapes, util } from '@joint/core';
import { getIntegrationMap } from '../services/s-integration-network';

export default function IntegrationNetwork() {
  const hostRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);
  const [workflows, setWorkflows] = useState([]);

  // ---- your files (from public/)
  const ICON_URL = {
    sender:   '/box-arrow-in-right.svg',
    receiver: '/box-arrow-in-left.svg',
    workflow: '/cpu-fill.svg'
  };

  // --------- helpers
  const resolvePublic = (url) => {
    if (!url) return '';
    // Absolute or data URI → leave as is
    if (/^(https?:)?\/\//i.test(url) || /^data:/i.test(url)) return url;
    // If app is served under a base path, prefix PUBLIC_URL
    const base = (process.env.PUBLIC_URL || '').replace(/\/+$/, '');
    if (url.startsWith('/')) return `${base}${url}`;
    return `${base}/${url}`;
  };

  const setIconUrl = (el, url) => {
    const resolved = resolvePublic(url);
    el.attr('image/href', resolved);
    el.attr('image/xlinkHref', resolved);
  };

  // ---------- payload -> workflows
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

  // ---------- fetch (uses your real fetch, falls back to sample)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true); setErr(null);
      try {
        const res = await getIntegrationMap?.();
        let obj = res?.data?.obj ?? null;

        // Fallback sample
        if (!obj) {
          obj = [{
            id: '_45ec2369b71df7a683452e21be2f8fd1',
            packageID: 'IIT',
            packageName: 'IIT',
            artifactID: '_45ec2369b71df7a683452e21be2f8fd1',
            artifactName: 'MON_Mixed_APIs_147',
            artifactVersion: 'Active',
            participants: [
              { id: 'Participant_99848', name: 'Sender1', messageFlows: [
                { id: 'MessageFlow_s1', properties: { direction: 'Sender', httpMethod: 'POST', Name: 'HTTP' } }
              ] },
              { id: 'Participant_99857', name: 'Sender2', messageFlows: [
                { id: 'MessageFlow_s2', properties: { direction: 'Sender', httpMethod: 'PUT', Name: 'HTTP' } }
              ] },
              {
                id: 'Participant_2', name: 'Receiver',
                messageFlows: [{
                  id: 'MessageFlow_22',
                  properties: {
                    httpMethod: 'POST', direction: 'Receiver', Name: 'HTTP',
                    system: 'Receiver', httpAddressWithoutQuery: 'https://api.restful-api.dev/objects'
                  }
                }]
              },
              {
                id: 'Participant_7', name: 'Receiver1',
                messageFlows: [{
                  id: 'MessageFlow_8',
                  properties: {
                    httpMethod: 'GET', direction: 'Receiver', Name: 'HTTP',
                    system: 'Receiver1', httpAddressWithoutQuery: 'https://dsfdsfs.nindasdja/fact'
                  }
                }]
              },
              {
                id: 'Participant_13', name: 'Receiver2',
                messageFlows: [{
                  id: 'MessageFlow_14',
                  properties: {
                    httpMethod: 'GET', direction: 'Receiver', Name: 'HTTP',
                    system: 'Receiver2', httpAddressWithoutQuery: 'https://api.coindesk.com/v1/bp1i/currentprice.json'
                  }
                }]
              }
            ]
          }];
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

    const cleanupFns = [];

    const PortGroup = { IN: 'in', OUT: 'out' };
    const colors = {
      red: '#ed2637',
      black: '#131e29',
      gray: '#dde6ed',
      blue: '#00a0e9',
      white: '#ffffff'
    };

    // Artifact dynamic sizing (min width/height; height scales with ports)
    const ARTIFACT_MIN = { width: 220, height: 150 };
    const ARTIFACT_PORT_SPACING = 30;
    const ARTIFACT_VERTICAL_PADDING = 90;
    const calcArtifactHeight = (inCount, outCount) => {
      const portsMax = Math.max(inCount || 0, outCount || 0, 1);
      const sizeFromPorts = ARTIFACT_VERTICAL_PADDING + portsMax * ARTIFACT_PORT_SPACING;
      return Math.max(ARTIFACT_MIN.height, sizeFromPorts);
    };

    // ELEMENT TEMPLATE (image-based)
    const elementTemplateBase = new shapes.standard.BorderedImage({
      size: { width: 140, height: 110 },
      attrs: {
        root: { magnet: false },
        background: { fill: colors.white },
        border: { rx: 8, ry: 8, stroke: colors.black, strokeWidth: 3 },

        // Icon area (16px padding; leave space for label)
        image: {
          x: 16,
          y: 16,
          width: 'calc(w - 32)',
          height: 'calc(h - 40)',
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
      // diamond visual + invisible circular magnet
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

    // LINK TEMPLATE
    const templateLink = new shapes.standard.Link({
      attrs: { line: { stroke: colors.black, strokeWidth: 2 } },
      defaultLabel: {
        markup: util.svg/* xml */`<rect @selector="labelBody" /><text @selector="labelText" />`,
        attrs: {
          root: { cursor: 'pointer' },
          labelText: {
            fill: colors.black,
            fontSize: 12,
            fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
            fontWeight: 'bold',
            textAnchor: 'middle',
            textVerticalAnchor: 'middle',
            textWrap: { width: 120, height: null }
          },
          labelBody: {
            rx: 4, ry: 4, ref: 'labelText',
            x: 'calc(x - 4)', y: 'calc(y - 4)',
            width: 'calc(w + 8)', height: 'calc(h + 8)',
            fill: colors.white, stroke: colors.black, strokeWidth: 2
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
      snapLinks: true,
      interactive: { linkMove: false, labelMove: false },
      defaultConnectionPoint: { name: 'boundary' },
      clickThreshold: 5,
      magnetThreshold: 'onleave',
      markAvailable: true,
      highlighting: {
        connecting: false,
        magnetAvailability: {
          name: 'mask',
          options: { padding: 1, attrs: { stroke: colors.blue, 'stroke-width': 4 } }
        }
      },
      defaultLink: () => templateLink.clone()
    });

    // ----- Zoom (wheel) + Pan (drag on blank)
    let zoom = 1;
    const Z_MIN = 0.4, Z_MAX = 2.0;

    function clientToLocal(clientX, clientY) {
      const rect = paper.svg.getBoundingClientRect();
      const pt = paper.svg.createSVGPoint();
      pt.x = clientX - rect.left;
      pt.y = clientY - rect.top;
      return pt.matrixTransform(paper.viewport.getCTM().inverse());
    }

    function onWheel(evt) {
      evt.preventDefault();
      const raw = evt.deltaY != null ? -evt.deltaY : (evt.wheelDelta != null ? evt.wheelDelta : -evt.detail);
      const step = (raw > 0 ? 1 : -1) * 0.1;
      const newZoom = Math.max(Z_MIN, Math.min(Z_MAX, zoom + step));
      if (newZoom === zoom) return;
      const p = clientToLocal(evt.clientX, evt.clientY);
      paper.scale(newZoom, newZoom, p.x, p.y);
      zoom = newZoom;
    }

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
      if (!isPanning) return;
      const dx = e.clientX - panStart.x;
      const dy = e.clientY - panStart.y;
      paper.translate(panOrigin.tx + dx, panOrigin.ty + dy);
    };
    const endPan = () => {
      isPanning = false;
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', endPan);
      paper.svg.style.cursor = '';
    };

    paper.on('blank:pointerdown', (evt) => {
      isPanning = true;
      panStart = { x: evt.clientX, y: evt.clientY };
      panOrigin = paper.translate();
      paper.svg.style.cursor = 'grabbing';
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', endPan);
    });
    cleanupFns.push(() => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', endPan);
    });

    // ====== helpers ======
    const createElement = (labelText, type = 'workflow') => {
      const el = elementTemplateBase.clone().attr({ label: { text: labelText } });
      const url = ICON_URL[type] || ICON_URL.workflow;
      if (url) setIconUrl(el, url);
      return el;
    };

    const createLink = (text) => {
      const link = templateLink.clone();
      if (text) {
        link.labels([{
          attrs: {
            labelText: { text },
            labelBody: { fill: colors.white }
          }
        }]);
      }
      link.connector('rounded');
      return link;
    };

    // ====== LAYOUT (vertical columns per workflow)
    const arrangeVerticalColumns = (
      clusters,
      { startY = 100, laneGapY = 120, centerX = 700, columnGapX = 260, rowGapY = 24 } = {}
    ) => {
      let currentY = startY;

      clusters.forEach((cl) => {
        const { artifactEl, leftEls, rightEls } = cl;
        const aSize = artifactEl.size();
        const aW = aSize.width, aH = aSize.height;

        const leftHeights = leftEls.map(el => el.size().height);
        const leftTotalH = leftHeights.reduce((s, h) => s + h, 0) + Math.max(0, leftEls.length - 1) * rowGapY;

        const rightHeights = rightEls.map(el => el.size().height);
        const rightTotalH = rightHeights.reduce((s, h) => s + h, 0) + Math.max(0, rightEls.length - 1) * rowGapY;

        const laneHeight = Math.max(aH, leftTotalH, rightTotalH, 1);
        const laneTop = currentY;
        const laneMidY = laneTop + laneHeight / 2;

        // Artifact (center)
        artifactEl.position(centerX - aW / 2, laneMidY - aH / 2);

        // Left column (senders)
        let leftY = laneMidY - leftTotalH / 2;
        leftEls.forEach((el) => {
          const { width: w, height: h } = el.size();
          const x = centerX - columnGapX - w / 2;
          el.position(x, leftY);
          leftY += h + rowGapY;
        });

        // Right column (receivers)
        let rightY = laneMidY - rightTotalH / 2;
        rightEls.forEach((el) => {
          const { width: w, height: h } = el.size();
          const x = centerX + columnGapX - w / 2;
          el.position(x, rightY);
          rightY += h + rowGapY;
        });

        currentY += laneHeight + laneGapY;
      });
    };

    // ---------- build all workflows ----------
    const clusters = [];
    const dirOf = (mf) => String(mf?.properties?.direction || '').toLowerCase();

    workflows.forEach((wf) => {
      const participants = Array.isArray(wf.participants) ? wf.participants : [];

      // Only participants that HAVE at least one message flow
      const withFlows = participants.filter(
        p => Array.isArray(p.messageFlows) && p.messageFlows.length > 0
      );

      const senderFlows = [];   // participant -> artifact
      const receiverFlows = []; // artifact -> participant

      const pElMap = new Map();
      const leftEls = [];  // senders
      const rightEls = []; // receivers

      withFlows.forEach(p => {
        const flows = Array.isArray(p.messageFlows) ? p.messageFlows : [];
        const inToParticipant    = flows.filter(mf => dirOf(mf) === 'receiver'); // artifact -> participant
        const outFromParticipant = flows.filter(mf => dirOf(mf) === 'sender');   // participant -> artifact

        inToParticipant.forEach(mf => receiverFlows.push({ participant: p, mf }));
        outFromParticipant.forEach(mf => senderFlows.push({ participant: p, mf }));

        // Decide icon type
        const type =
          inToParticipant.length > 0
            ? 'receiver'
            : outFromParticipant.length > 0
            ? 'sender'
            : 'workflow';

        // participant element + ports
        const el = createElement(p.name || p.id, type).set('service', p.id);
        const inPorts  = inToParticipant.map((_, i) => ({ group: PortGroup.IN,  id: `in${i + 1}` }));
        const outPorts = outFromParticipant.map((_, i) => ({ group: PortGroup.OUT, id: `out${i + 1}` }));
        el.addPorts([...inPorts, ...outPorts]);

        pElMap.set(p.id, { element: el, inCount: inPorts.length, outCount: outPorts.length });

        if (inPorts.length > 0) rightEls.push(el);
        else if (outPorts.length > 0) leftEls.push(el);
      });

      // artifact ports + dynamic height
      const artifactInPorts  = senderFlows.map((_, i) => ({ group: PortGroup.IN,  id: `in${i + 1}` }));
      const artifactOutPorts = receiverFlows.map((_, i) => ({ group: PortGroup.OUT, id: `out${i + 1}` }));
      const dynamicHeight = calcArtifactHeight(artifactInPorts.length, artifactOutPorts.length);

      const artifactEl = createElement(wf.artifactName || 'Artifact', 'workflow')
        .set('service', wf.artifactID || (wf.artifactName || 'Artifact'))
        .size({ width: ARTIFACT_MIN.width, height: dynamicHeight })
        .addPorts([...artifactInPorts, ...artifactOutPorts]);

      clusters.push({ artifactEl, leftEls, rightEls, senderFlows, receiverFlows, pElMap });
    });

    // add all elements first
    graph.addCells(clusters.flatMap(c => [c.artifactEl, ...c.leftEls, ...c.rightEls]));

    // link after render (ensures port geometry is ready)
    paper.once('render:done', () => {
      const timer = setTimeout(() => {
        const links = [];

        clusters.forEach((cl) => {
          const { artifactEl, senderFlows, receiverFlows, pElMap } = cl;

          // Sender: participant OUT -> artifact IN
          let artInIdx = 1;
          senderFlows.forEach(({ participant, mf }) => {
            const pi = pElMap.get(participant.id);
            if (!pi) return;
            const label =
              (mf?.properties?.httpMethod ? `${mf.properties.httpMethod}` : '') ||
              (mf?.properties?.Name || '') || '';
            const outPortId = `out${Math.min(artInIdx, Math.max(1, pi.outCount))}`;
            links.push(
              createLink(label).set({
                source: { id: pi.element.id, port: outPortId },
                target: { id: artifactEl.id,   port: `in${artInIdx}` }
              })
            );
            artInIdx += 1;
          });

          // Receiver: artifact OUT -> participant IN
          let artOutIdx = 1;
          receiverFlows.forEach(({ participant, mf }) => {
            const pi = pElMap.get(participant.id);
            if (!pi) return;
            const label =
              (mf?.properties?.httpMethod ? `${mf.properties.httpMethod}` : '') ||
              (mf?.properties?.Name || '') || '';
            const inPortId = `in${Math.min(artOutIdx, Math.max(1, pi.inCount))}`;
            links.push(
              createLink(label).set({
                source: { id: artifactEl.id,   port: `out${artOutIdx}` },
                target: { id: pi.element.id, port: inPortId }
              })
            );
            artOutIdx += 1;
          });
        });

        graph.addCells(links);

        // arrange as vertical columns
        arrangeVerticalColumns(clusters, {
          startY: 80,
          laneGapY: 120,
          centerX: 900,
          columnGapX: 320,
          rowGapY: 28
        });

        // Grow paper to content once; users can then pan/zoom
        try { paper.fitToContent({ padding: 40, allowNewOrigin: 'any' }); } catch {}

        clearTimeout(timer);
      }, 250);
    });

    // cleanup
    return () => {
      cleanupFns.forEach(fn => { try { fn(); } catch {} });
      try { paper.remove(); } catch {}
      try { graph.clear(); } catch {}
    };
  }, [workflows]);

  if (loading) return <div style={{ padding: 12 }}>Loading…</div>;
  if (err) return <div style={{ padding: 12, color: 'crimson' }}>Error: {String(err)}</div>;
  if (!workflows.length) return <div style={{ padding: 12 }}>No data.</div>;

  // Host container with scrollbars
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
