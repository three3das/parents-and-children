import { useEffect, useRef, useState } from 'react';
import { Pencil } from 'lucide-react';
import { BORDER_WIDTH, ERASE_DRAWING_EVENT, GOLD_100, GOLD_33, SILVER, WHITE } from './constants';
import { L, pickLabel } from './labels';
import { PILL_BASE_CLASS, PILL_STYLE, PILL_TEXT_CLASS } from './pillStyle';

interface DrawingPadProps {
  letterSymbol: string | null;
  scriptSymbol: string | null;
  uiLanguage: string;
}

// Поле для письма от руки (Pointer Events: мышь, палец, стилус).
// touch-action: none обязателен — иначе на сенсорном экране страница
// скроллится вместо рисования.
//
// Холст теперь на золотом фоне (как зона 2), поэтому линия и трафарет —
// белые.
export function DrawingPad({ letterSymbol, scriptSymbol, uiLanguage }: DrawingPadProps) {
  const [mode, setMode] = useState<'letter' | 'script'>('letter');
  const [hasDrawn, setHasDrawn] = useState(false); // прячет подсказку
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDrawingRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);

  const hasSelection = Boolean(letterSymbol);
  const guideSymbol = mode === 'letter' ? letterSymbol : scriptSymbol;

  useEffect(() => {
    function setupCanvas() {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.max(1, Math.round(rect.width * dpr));
      canvas.height = Math.max(1, Math.round(rect.height * dpr));
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(dpr, dpr);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = WHITE;
        ctx.lineWidth = 5;
      }
    }

    setupCanvas();
    window.addEventListener('resize', setupCanvas);
    return () => window.removeEventListener('resize', setupCanvas);
  }, []);

  // Смена буквы / системы письма / режима — очистка холста.
  useEffect(() => {
    clearCanvas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guideSymbol]);

  // Стиралка из панели режимов (GameMenu) очищает холст через событие.
  useEffect(() => {
    const onErase = () => clearCanvas();
    window.addEventListener(ERASE_DRAWING_EVENT, onErase);
    return () => window.removeEventListener(ERASE_DRAWING_EVENT, onErase);
    // clearCanvas работает только через ref и setState — пересоздавать не нужно.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function clearCanvas() {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    setHasDrawn(false);
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  function getRelativePoint(e: React.PointerEvent<HTMLCanvasElement>) {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function handlePointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    e.currentTarget.setPointerCapture(e.pointerId);
    isDrawingRef.current = true;
    lastPointRef.current = getRelativePoint(e);
    setHasDrawn(true);
  }

  function handlePointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!isDrawingRef.current) return;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx || !lastPointRef.current) return;

    const point = getRelativePoint(e);
    ctx.beginPath();
    ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
    ctx.lineTo(point.x, point.y);
    ctx.stroke();
    lastPointRef.current = point;
  }

  function handlePointerUp() {
    isDrawingRef.current = false;
    lastPointRef.current = null;
  }

  const toggleStyle = (active: boolean) =>
    active
      ? { backgroundColor: GOLD_100, color: WHITE, border: `${BORDER_WIDTH}px solid ${GOLD_100}` }
      : { backgroundColor: WHITE, color: SILVER, border: `${BORDER_WIDTH}px solid ${GOLD_33}` };

  const hoverHandlers = (active: boolean) => ({
    onMouseEnter: (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!active) e.currentTarget.style.backgroundColor = GOLD_33;
    },
    onMouseLeave: (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!active) e.currentTarget.style.backgroundColor = WHITE;
    },
  });

  const centerMessage = (text: string) => (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none px-4 text-center">
      <p className="text-xs font-bold" style={{ color: WHITE }}>
        {text}
      </p>
    </div>
  );

  return (
    <div className="contents sm:flex sm:flex-col sm:h-full">
      {/* На телефоне переключатель «Буква / Письмо» стоит столбиком слева от
          холста (холст сужается только по ширине); на sm и выше — как раньше,
          горизонтально над холстом. */}
      <div className="contents sm:flex sm:flex-1 sm:min-h-0 sm:flex-col sm:gap-1">
      <div className="col-start-2 row-start-1 row-span-2 flex flex-col sm:flex-row gap-1 sm:mb-0 flex-shrink-0">
        {(['letter', 'script'] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className="flex-1 px-1.5 sm:px-2 py-1 rounded text-[10px] font-bold transition-colors"
            style={toggleStyle(mode === m)}
            {...hoverHandlers(mode === m)}
          >
            {pickLabel(m === 'letter' ? L.toggleLetter : L.toggleScript, uiLanguage)}
          </button>
        ))}
        {/* Clear — третья кнопка между двумя полями (на телефоне — в центральной
            колонке, на sm и выше — в ряду под карточкой буквы). */}
        <button
          onClick={clearCanvas}
          className="flex-1 px-1.5 sm:px-2 py-1 rounded text-[10px] font-bold transition-colors"
          style={toggleStyle(false)}
          {...hoverHandlers(false)}
        >
          {pickLabel(L.clear, uiLanguage)}
        </button>
      </div>

      <div
        ref={containerRef}
        className="col-start-3 row-start-1 row-span-2 sm:col-auto sm:row-auto relative flex-1 min-h-0 min-w-0 rounded-xl shadow-md overflow-hidden"
        style={{
          touchAction: 'none',
          minHeight: '64px',
          backgroundColor: GOLD_100,
          border: `${BORDER_WIDTH}px solid ${GOLD_100}`,
        }}
      >
        {!hasSelection ? (
          centerMessage(pickLabel(L.pickLetter, uiLanguage))
        ) : guideSymbol ? (
          // Трафарет: SVG-текст с пунктирным контуром и бледной заливкой.
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none select-none"
            viewBox="0 0 100 100"
            preserveAspectRatio="xMidYMid meet"
            aria-hidden="true"
          >
            <text
              x="50"
              y="49"
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={guideSymbol.length > 2 ? 40 : 90}
              fontWeight={900}
              fill={WHITE}
              fillOpacity={0.3}
              stroke={WHITE}
              strokeWidth={0.8}
              strokeDasharray="2 1.5"
              strokeLinejoin="round"
            >
              {guideSymbol}
            </text>
          </svg>
        ) : (
          centerMessage(pickLabel(L.noScriptData, uiLanguage))
        )}

        {hasSelection && guideSymbol && !hasDrawn && (
          // Образец пилюли: тот же PILL_BASE_CLASS использует «Words for this letter».
          <div
            className={`absolute bottom-1.5 left-1/2 -translate-x-1/2 pointer-events-none ${PILL_BASE_CLASS}`}
            style={PILL_STYLE}
          >
            <Pencil className="w-3 h-3 flex-shrink-0" strokeWidth={2.5} />
            <span className={PILL_TEXT_CLASS}>{pickLabel(L.traceHint, uiLanguage)}</span>
          </div>
        )}

        <canvas
          ref={canvasRef}
          className="absolute inset-0"
          style={{ touchAction: 'none' }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          onPointerCancel={handlePointerUp}
        />
      </div>
      </div>

      <div className="hidden sm:flex items-center justify-between mt-1 flex-shrink-0">
        <h4 className="text-[10px] font-bold" style={{ color: SILVER }}>
          {pickLabel(L.write, uiLanguage)}
        </h4>
      </div>
    </div>
  );
}