// app.js — browser-ready (não usa imports; usa React UMD)
// Coloque esse arquivo na mesma pasta do index.html

// Pega hooks do React (já que não usamos import)
const { useState, useEffect, useCallback, useRef } = React;

const translations = {
  'pt-br': {
    credits: '© 2025 Todos os direitos reservados - Henzo Paes',
    title: '🎲 Bingo',
    from: 'De:',
    to: 'até:',
    import: '📁 Importar',
    export: '💾 Exportar',
    screenshot: '📸 Screenshot',
    numbers_drawn: 'Números sorteados:',
    dice_hint: 'Clique, ESPAÇO ou balance o celular!',
    one_die: '1 Dado',
    two_dice: '2 Dados',
    three_dice: '3 Dados',
    numbers_drawn_click: 'Números Sorteados (clique para copiar)',
    empty_state: 'Nenhum número sorteado ainda. Clique no dado para começar!',
    history_stats: '📊 Histórico & Estatísticas',
    total_drawn: 'Total Sorteado',
    avg_time: 'Tempo Médio',
    most_common: 'Mais Sorteado',
    least_common: 'Menos Sorteado',
    exit: 'Sair',
    themes: 'Temas',
    confetti: 'Confetti!',
    history: 'Histórico',
    presentation: 'Apresentação',
    backup: 'Backup',
    all_numbers_drawn: '🎉 Todos os números possíveis já foram sorteados!',
    number_copied: 'Número {0} copiado!',
    winner_congrats: '🎊 Parabéns ao vencedor!'
  },
  'en': {
    credits: '© 2025 All rights reserved - Henzo Paes',
    title: '🎲 Bingo',
    from: 'From:',
    to: 'to:',
    import: '📁 Import',
    export: '💾 Export',
    screenshot: '📸 Screenshot',
    numbers_drawn: 'Numbers drawn:',
    dice_hint: 'Click, SPACE or shake your phone!',
    one_die: '1 Die',
    two_dice: '2 Dice',
    three_dice: '3 Dice',
    numbers_drawn_click: 'Drawn Numbers (click to copy)',
    empty_state: 'No numbers drawn yet. Click the die to start!',
    history_stats: '📊 History & Statistics',
    total_drawn: 'Total Drawn',
    avg_time: 'Average Time',
    most_common: 'Most Common',
    least_common: 'Least Common',
    exit: 'Exit',
    themes: 'Themes',
    confetti: 'Confetti!',
    history: 'History',
    presentation: 'Presentation',
    backup: 'Backup',
    all_numbers_drawn: '🎉 All possible numbers have been drawn!',
    number_copied: 'Number {0} copied!',
    winner_congrats: '🎊 Congratulations to the winner!'
  }
};

const themes = {
  default: {
    primary: '#A67C52',
    secondary: '#F5F0E6',
    background: 'linear-gradient(135deg, #F5F0E6 0%, #FFFFFF 100%)',
    text: '#4A4A4A',
    card: '#FFFFFF',
    accent: '#D4A574'
  },
  dark: {
    primary: '#BB8A5C',
    secondary: '#2D2D2D',
    background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
    text: '#E0E0E0',
    card: '#3A3A3A',
    accent: '#E6B885'
  },
  halloween: {
    primary: '#FF6B35',
    secondary: '#2D1B2E',
    background: 'linear-gradient(135deg, #2D1B2E 0%, #1a0e1b 100%)',
    text: '#F5F5F5',
    card: '#3D2B3E',
    accent: '#FFB347'
  },
  christmas: {
    primary: '#C41E3A',
    secondary: '#0F4B0F',
    background: 'linear-gradient(135deg, #0F4B0F 0%, #2E8B57 100%)',
    text: '#FFFFFF',
    card: '#1B5B1B',
    accent: '#FFD700'
  },
  casino: {
    primary: '#DC143C',
    secondary: '#006400',
    background: 'linear-gradient(135deg, #006400 0%, #228B22 100%)',
    text: '#FFFFFF',
    card: '#2F4F2F',
    accent: '#FFD700'
  }
};

function BingoApp() {
  const [language, setLanguage] = useState('pt-br');
  const [theme, setTheme] = useState('default');
  const [minRange, setMinRange] = useState(0);
  const [maxRange, setMaxRange] = useState(99);
  const [drawnNumbers, setDrawnNumbers] = useState([]);
  const [drawHistory, setDrawHistory] = useState([]);
  const [diceCount, setDiceCount] = useState(1);
  const [isRolling, setIsRolling] = useState(false);
  const [showRipple, setShowRipple] = useState(false);
  const [currentDiceValues, setCurrentDiceValues] = useState(['?']);
  const [showHistory, setShowHistory] = useState(false);
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [notification, setNotification] = useState(null);
  const [confetti, setConfetti] = useState([]);
  const [floatingNumbers, setFloatingNumbers] = useState([]);
  const fileInputRef = useRef(null);

  const t = useCallback((key, ...args) => {
    let text = translations[language]?.[key] || translations['pt-br'][key] || key;
    args.forEach((arg, index) => {
      text = text.replace(`{${index}}`, arg);
    });
    return text;
  }, [language]);

  const showNotification = useCallback((message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  }, []);

  const triggerConfetti = useCallback(() => {
    const newConfetti = Array.from({ length: 150 }, (_, i) => ({
      id: Date.now() + i,
      left: Math.random() * 100,
      color: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FCEA2B'][Math.floor(Math.random() * 6)],
      duration: Math.random() * 2 + 2.5,
      delay: i * 0.015,
      size: Math.random() * 6 + 4
    }));
    setConfetti(newConfetti);
    setTimeout(() => setConfetti([]), 5000);
    showNotification(t('winner_congrats'), 'success');
  }, [t, showNotification]);

  const rollDice = useCallback(() => {
    if (isRolling) return;

    const totalPossible = maxRange - minRange + 1;
    if (drawnNumbers.length >= totalPossible) {
      showNotification(t('all_numbers_drawn'), 'info');
      return;
    }

    setIsRolling(true);
    const startTime = Date.now();

    const animationInterval = setInterval(() => {
      setCurrentDiceValues(Array.from({ length: diceCount }, () =>
        Math.floor(Math.random() * (maxRange - minRange + 1)) + minRange
      ));
    }, 80);

    setTimeout(() => {
      clearInterval(animationInterval);

      const newNumbers = [];
      for (let i = 0; i < diceCount; i++) {
        let newNumber;
        do {
          newNumber = Math.floor(Math.random() * (maxRange - minRange + 1)) + minRange;
        } while (drawnNumbers.includes(newNumber) || newNumbers.includes(newNumber));
        newNumbers.push(newNumber);
      }

      setCurrentDiceValues(newNumbers);
      setDrawnNumbers(prev => [...newNumbers, ...prev]);
      setDrawHistory(prev => [
        ...newNumbers.map(num => ({
          number: num,
          timestamp: new Date(),
          duration: Date.now() - startTime
        })),
        ...prev
      ]);

      setFloatingNumbers(newNumbers.map((num, i) => ({
        id: Date.now() + i,
        value: num,
        left: 50 + (i - newNumbers.length / 2) * 10
      })));

      setTimeout(() => {
        setFloatingNumbers([]);
        setIsRolling(false);
      }, 2000);
    }, 1200);
  }, [isRolling, minRange, maxRange, drawnNumbers, diceCount, t, showNotification]);

  const copyNumber = useCallback((number) => {
    navigator.clipboard.writeText(number.toString());
    showNotification(t('number_copied', number), 'success');
  }, [t, showNotification]);

  const exportData = useCallback(() => {
    const data = {
      version: "2.0",
      timestamp: new Date().toISOString(),
      range: { min: minRange, max: maxRange },
      drawnNumbers,
      drawHistory,
      theme,
      language
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bingo-pro-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification('Dados exportados!', 'success');
  }, [minRange, maxRange, drawnNumbers, drawHistory, theme, language, showNotification]);

  const importData = useCallback((event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (data.range) {
          setMinRange(data.range.min);
          setMaxRange(data.range.max);
        }
        if (data.drawnNumbers) setDrawnNumbers(data.drawnNumbers);
        if (data.drawHistory) setDrawHistory(data.drawHistory);
        if (data.theme) setTheme(data.theme);
        if (data.language) setLanguage(data.language);
        showNotification('Dados importados!', 'success');
      } catch (error) {
        showNotification('Erro ao importar arquivo!', 'error');
      }
    };
    reader.readAsText(file);
  }, [showNotification]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        rollDice();
      } else if (e.code === 'KeyF') {
        e.preventDefault();
        setShowFullscreen(prev => !prev);
      } else if (e.code === 'KeyH') {
        e.preventDefault();
        setShowHistory(prev => !prev);
      } else if (e.code === 'KeyC') {
        e.preventDefault();
        triggerConfetti();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [rollDice, triggerConfetti]);

  useEffect(() => {
    let lastShake = 0;
    const handleMotion = (event) => {
      const current = Date.now();
      if (current - lastShake < 1000) return;

      const acc = event.accelerationIncludingGravity;
      if (!acc) return;
      const total = Math.abs(acc.x) + Math.abs(acc.y) + Math.abs(acc.z);

      if (total > 15) {
        lastShake = current;
        setTimeout(rollDice, 300);
      }
    };

    window.addEventListener('devicemotion', handleMotion);
    return () => window.removeEventListener('devicemotion', handleMotion);
  }, [rollDice]);

  const currentTheme = themes[theme] || themes.default;
  const totalPossible = maxRange - minRange + 1;

  const stats = {
    totalDrawn: drawnNumbers.length,
    avgTime: drawHistory.length > 0 
      ? (drawHistory.reduce((sum, item) => sum + item.duration, 0) / drawHistory.length / 1000).toFixed(1) + 's'
      : '0s',
    mostCommon: drawnNumbers[0] || '-',
    leastCommon: drawnNumbers[drawnNumbers.length - 1] || '-'
  };

  return (
    <div 
      className="min-h-screen flex flex-col transition-all duration-700 ease-in-out"
      style={{ 
        background: currentTheme.background,
        color: currentTheme.text
      }}
    >
      <style>{`
        * {
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        }
        /* animations/style omitted here for brevity in the example - keep the same as original if desired */
      `}</style>

      {/* Confetti */}
      {confetti.map(item => (
        <div
          key={item.id}
          className="fixed rounded-full pointer-events-none z-50"
          style={{
            left: `${item.left}%`,
            top: '-10vh',
            width: `${item.size}px`,
            height: `${item.size}px`,
            backgroundColor: item.color,
            animation: `confetti-fall ${item.duration}s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards`,
            animationDelay: `${item.delay}s`,
            boxShadow: `0 0 ${item.size * 2}px ${item.color}40`
          }}
        />
      ))}

      {/* Floating Numbers */}
      {floatingNumbers.map(item => (
        <div
          key={item.id}
          className="fixed text-6xl font-bold pointer-events-none z-40"
          style={{
            left: `${item.left}%`,
            top: '50%',
            color: currentTheme.primary,
            textShadow: `0 0 20px ${currentTheme.accent}, 2px 2px 4px rgba(0,0,0,0.5)`,
            animation: 'float-up 2.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
            fontWeight: 900
          }}
        >
          {item.value}
        </div>
      ))}

      {/* Notification */}
      {notification && (
        <div 
          className={`fixed top-4 right-4 px-6 py-4 rounded-2xl shadow-2xl z-50 smooth-slide ${
            notification.type === 'success' ? 'bg-green-500' :
            notification.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
          } text-white font-semibold backdrop-blur-xl`}
        >
          {notification.message}
        </div>
      )}

      {/* Credits */}
      <div 
        className="fixed bottom-2 right-2 text-xs opacity-60 px-3 py-1 rounded-lg z-10"
        style={{ 
          backgroundColor: 'rgba(0,0,0,0.1)',
          backdropFilter: 'blur(10px)'
        }}
      >
        {t('credits')}
      </div>

      {/* Language & Theme Selector */}
      <div className="fixed bottom-5 left-5 flex gap-3 z-50">
        <div className="relative">
          <button
            onClick={() => setShowLanguageMenu(!showLanguageMenu)}
            className="px-4 py-3 rounded-full text-white font-semibold shadow-lg hover-lift"
            style={{ backgroundColor: currentTheme.primary }}
          >
            🌐 {language === 'pt-br' ? 'PT-BR' : 'EN'}
          </button>
          {showLanguageMenu && (
            <div 
              className="absolute bottom-16 left-0 rounded-2xl p-3 shadow-2xl min-w-[200px] glass-effect smooth-enter"
              style={{ backgroundColor: currentTheme.card }}
            >
              {['pt-br', 'en'].map(lang => (
                <button
                  key={lang}
                  onClick={() => {
                    setLanguage(lang);
                    setShowLanguageMenu(false);
                  }}
                  className="w-full px-4 py-2 rounded-xl text-left transition-all duration-300 ease-out hover:transform hover:translate-x-1"
                  style={{
                    backgroundColor: language === lang ? currentTheme.primary : 'transparent',
                    color: language === lang ? 'white' : currentTheme.text
                  }}
                >
                  {lang === 'pt-br' ? '🇧🇷 Português' : '🇺🇸 English'}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => setShowThemeMenu(!showThemeMenu)}
            className="px-4 py-3 rounded-full text-white font-semibold shadow-lg hover-lift"
            style={{ backgroundColor: currentTheme.primary }}
          >
            🎨 {t('themes')}
          </button>
          {showThemeMenu && (
            <div 
              className="absolute bottom-16 left-0 rounded-2xl p-3 shadow-2xl min-w-[200px] glass-effect smooth-enter"
              style={{ backgroundColor: currentTheme.card }}
            >
              {Object.keys(themes).map(themeName => (
                <button
                  key={themeName}
                  onClick={() => {
                    setTheme(themeName);
                    setShowThemeMenu(false);
                  }}
                  className="w-full px-4 py-2 rounded-xl text-left transition-all duration-300 ease-out hover:transform hover:translate-x-1 capitalize"
                  style={{
                    backgroundColor: theme === themeName ? currentTheme.primary : 'transparent',
                    color: theme === themeName ? 'white' : currentTheme.text
                  }}
                >
                  {themeName}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Action Panel */}
      <div className="fixed bottom-5 right-5 flex flex-col gap-4 z-50">
        <button
          onClick={triggerConfetti}
          className="w-14 h-14 rounded-full text-white text-2xl shadow-lg hover-lift glow-effect"
          style={{ backgroundColor: currentTheme.primary }}
          title={t('confetti')}
        >
          🎊
        </button>
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="w-14 h-14 rounded-full text-white text-2xl shadow-lg hover-lift"
          style={{ backgroundColor: currentTheme.primary }}
          title={t('history')}
        >
          📊
        </button>
        <button
          onClick={() => setShowFullscreen(!showFullscreen)}
          className="w-14 h-14 rounded-full text-white text-2xl shadow-lg hover-lift"
          style={{ backgroundColor: currentTheme.primary }}
          title={t('presentation')}
        >
          📺
        </button>
      </div>

      {/* Header */}
      <div className="p-6 flex flex-wrap justify-between items-center gap-4 glass-effect">
        <h1 
          className="text-4xl font-bold cursor-pointer transition-all duration-500 ease-out hover:scale-105"
          style={{ color: currentTheme.primary, textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}
          onClick={triggerConfetti}
        >
          {t('title')}
        </h1>

        <div className="flex flex-wrap gap-3 items-center">
          <div 
            className="flex items-center gap-2 px-4 py-2 rounded-full shadow-lg hover-lift glass-effect"
            style={{ backgroundColor: currentTheme.card }}
          >
            <span>{t('from')}</span>
            <input
              type="number"
              value={minRange}
              onChange={(e) => setMinRange(Number(e.target.value))}
              className="w-16 px-2 py-1 rounded-lg text-center border-2 transition-all duration-300 ease-out focus:scale-105 focus:shadow-lg"
              style={{ 
                borderColor: currentTheme.primary,
                backgroundColor: currentTheme.card,
                color: currentTheme.text
              }}
            />
            <span>{t('to')}</span>
            <input
              type="number"
              value={maxRange}
              onChange={(e) => setMaxRange(Number(e.target.value))}
              className="w-16 px-2 py-1 rounded-lg text-center border-2 transition-all duration-300 ease-out focus:scale-105 focus:shadow-lg"
              style={{ 
                borderColor: currentTheme.primary,
                backgroundColor: currentTheme.card,
                color: currentTheme.text
              }}
            />
          </div>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 rounded-full text-white font-semibold shadow-lg hover-lift"
            style={{ backgroundColor: currentTheme.primary }}
          >
            {t('import')}
          </button>

          <button
            onClick={exportData}
            className="px-4 py-2 rounded-full text-white font-semibold shadow-lg hover-lift"
            style={{ backgroundColor: currentTheme.primary }}
          >
            {t('export')}
          </button>

          <div 
            className="px-4 py-2 rounded-full font-bold shadow-lg transition-all duration-300 hover:scale-105"
            style={{ 
              backgroundColor: currentTheme.card,
              color: currentTheme.primary
            }}
          >
            {t('numbers_drawn')} {drawnNumbers.length} de {totalPossible}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-8 min-h-[400px]">
        <div className="relative">
          <div 
            className="absolute -top-16 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-full text-sm whitespace-nowrap opacity-90 shadow-lg"
            style={{ 
              backgroundColor: currentTheme.primary,
              color: 'white',
              animation: 'bounce 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite'
            }}
          >
            {t('dice_hint')}
          </div>

          <div className="flex gap-5 items-center">
            {currentDiceValues.map((value, i) => (
              <div
                key={i}
                onClick={rollDice}
                className={`w-32 h-32 rounded-3xl flex items-center justify-center text-5xl font-bold cursor-pointer shadow-2xl hover-lift relative overflow-hidden ${
                  isRolling ? 'spinning' : ''
                }`}
                style={{
                  background: `linear-gradient(145deg, ${currentTheme.card}, ${currentTheme.secondary})`,
                  color: currentTheme.primary,
                  boxShadow: `0 10px 30px rgba(0,0,0,0.3), inset 0 2px 5px rgba(255,255,255,0.2)`,
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                {showRipple && (
                  <div
                    className="absolute inset-0 rounded-3xl pointer-events-none"
                    style={{
                      background: currentTheme.accent,
                      animation: 'ripple 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                      opacity: 0.3
                    }}
                  />
                )}
                {value}
              </div>
            ))}
          </div>

          <div className="absolute -bottom-20 left-1/2 transform -translate-x-1/2 flex gap-2">
            {[1, 2, 3].map(count => (
              <button
                key={count}
                onClick={() => {
                  setDiceCount(count);
                  setCurrentDiceValues(Array(count).fill('?'));
                }}
                className="px-4 py-2 rounded-full text-white text-sm font-semibold shadow-lg hover-lift"
                style={{ 
                  backgroundColor: diceCount === count ? currentTheme.accent : currentTheme.primary,
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                {t(count === 1 ? 'one_die' : count === 2 ? 'two_dice' : 'three_dice')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer - Drawn Numbers */}
      <div 
        className="p-6 glass-effect shadow-2xl"
      >
        <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
          <h3 
            className="text-xl font-bold"
            style={{ color: currentTheme.primary }}
          >
            {t('numbers_drawn_click')}
          </h3>
          <div className="flex gap-2">
            {[[1, 50], [1, 75], [1, 90], [0, 99]].map(([min, max]) => (
              <button
                key={`${min}-${max}`}
                onClick={() => {
                  setMinRange(min);
                  setMaxRange(max);
                  setDrawnNumbers([]);
                  setDrawHistory([]);
                }}
                className="px-3 py-1 rounded-full text-sm font-semibold border-2 hover-lift"
                style={{ 
                  borderColor: currentTheme.primary,
                  color: currentTheme.primary,
                  backgroundColor: 'transparent',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                {min}-{max}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-3 justify-center flex-wrap">
          {drawnNumbers.length === 0 ? (
            <div className="text-center py-10 opacity-70 italic smooth-enter">
              {t('empty_state')}
            </div>
          ) : (
            drawnNumbers.map((number, index) => (
              <div
                key={index}
                onClick={() => copyNumber(number)}
                className="min-w-[60px] h-16 rounded-xl flex items-center justify-center text-xl font-bold cursor-pointer shadow-lg hover-lift"
                style={{
                  background: `linear-gradient(145deg, ${currentTheme.primary}, ${currentTheme.accent})`,
                  color: 'white',
                  animation: `slideIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) ${index * 0.05}s both`
                }}
              >
                {number}
              </div>
            ))
          )}
        </div>
      </div>

      {/* History Panel */}
      {showHistory && (
        <div 
          className="fixed top-0 right-0 w-full md:w-96 h-full shadow-2xl z-50 overflow-y-auto smooth-slide"
          style={{ backgroundColor: currentTheme.card }}
        >
          <div 
            className="p-6 border-b flex justify-between items-center sticky top-0 glass-effect"
            style={{ 
              borderColor: currentTheme.secondary,
              backgroundColor: currentTheme.card
            }}
          >
            <h3 className="text-xl font-bold">{t('history_stats')}</h3>
            <button
              onClick={() => setShowHistory(false)}
              className="px-4 py-2 rounded-full text-white font-semibold hover-lift"
              style={{ backgroundColor: currentTheme.primary }}
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 p-6">
            {Object.entries(stats).map(([key, value], index) => (
              <div
                key={key}
                className="p-4 rounded-xl text-center shadow-lg hover-lift smooth-enter"
                style={{ 
                  backgroundColor: currentTheme.secondary,
                  animationDelay: `${index * 0.1}s`
                }}
              >
                <div 
                  className="text-3xl font-bold transition-all duration-300"
                  style={{ color: currentTheme.primary }}
                >
                  {value}
                </div>
                <div className="text-sm opacity-80 mt-1">
                  {t(key.replace(/([A-Z])/g, '_$1').toLowerCase())}
                </div>
              </div>
            ))}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {drawHistory.slice(0, 50).map((item, index) => (
              <div
                key={index}
                className="p-4 border-b transition-all duration-300 ease-out hover:bg-white/5 hover:translate-x-1"
                style={{ borderColor: currentTheme.secondary }}
              >
                <div 
                  className="text-2xl font-bold"
                  style={{ color: currentTheme.primary }}
                >
                  {item.number}
                </div>
                <div className="text-sm opacity-70 mt-1">
                  {new Date(item.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Fullscreen Mode */}
      {showFullscreen && (
        <div 
          className="fixed inset-0 flex flex-col items-center justify-center z-50 smooth-enter"
          style={{ background: currentTheme.background }}
        >
          <div
            onClick={rollDice}
            className={`w-52 h-52 rounded-3xl flex items-center justify-center text-8xl font-bold cursor-pointer shadow-2xl mb-8 relative overflow-hidden ${
              isRolling ? 'spinning' : ''
            } glow-effect hover-lift`}
            style={{
              background: `linear-gradient(145deg, ${currentTheme.card}, ${currentTheme.secondary})`,
              color: currentTheme.primary,
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            {showRipple && (
              <div
                className="absolute inset-0 rounded-3xl pointer-events-none"
                style={{
                  background: currentTheme.accent,
                  animation: 'ripple 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                  opacity: 0.3
                }}
              />
            )}
            {currentDiceValues[0]}
          </div>

          {drawnNumbers[0] && (
            <div 
              className="text-8xl font-bold smooth-enter"
              style={{ 
                color: currentTheme.primary,
                textShadow: `0 0 30px ${currentTheme.accent}`,
                animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
              }}
            >
              {currentDiceValues.join(' - ')}
            </div>
          )}

          <button
            onClick={() => setShowFullscreen(false)}
            className="fixed top-8 right-8 px-6 py-3 rounded-full text-white font-semibold shadow-lg hover-lift"
            style={{ backgroundColor: currentTheme.primary }}
          >
            {t('exit')}
          </button>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={importData}
        className="hidden"
      />
    </div>
  );
}

// Monta a aplicação no DOM
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<BingoApp />);
