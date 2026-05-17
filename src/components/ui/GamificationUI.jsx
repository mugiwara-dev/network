import { useLabStore, ACHIEVEMENTS } from '../../store/useLabStore'
import { useState, useEffect } from 'react'

/**
 * QuizModal — pops up after each component install with a multiple-choice question.
 * Correct answer awards XP. Fun fact always shown after answering.
 */
export function QuizModal() {
  const { activeQuiz, submitQuizAnswer, closeQuiz, quizAnswered } = useLabStore()
  const [selected, setSelected] = useState(null)
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    setSelected(null)
    setRevealed(false)
  }, [activeQuiz?.compId])

  if (!activeQuiz) return null

  const answered = quizAnswered[activeQuiz.compId]
  const handleSelect = (idx) => {
    if (revealed) return
    setSelected(idx)
    setRevealed(true)
    submitQuizAnswer(activeQuiz.compId, idx)
  }

  const isCorrect = selected === activeQuiz.answer
  const optColors = ['#00aaff','#e879f9','#f59e0b','#10b981']

  return (
    <div style={{
      position:'fixed',inset:0,background:'rgba(0,0,0,0.75)',zIndex:200,
      display:'flex',alignItems:'center',justifyContent:'center',
      animation:'fadeInUp 0.3s ease',backdropFilter:'blur(4px)'
    }}>
      <div className="glass-panel quiz-modal-inner" style={{
        maxWidth:480,width:'90vw',padding:'24px',
        border:'1px solid rgba(0,255,200,0.3)',
        boxShadow:'0 0 40px rgba(0,255,200,0.15)',
        position:'relative'
      }}>
        {/* Close */}
        <button onClick={closeQuiz} style={{
          position:'absolute',top:12,right:12,background:'none',border:'none',
          color:'#64748b',cursor:'pointer',fontSize:16
        }}>✕</button>

        {/* Header */}
        <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:18}}>
          <div style={{
            width:36,height:36,borderRadius:8,
            background:'linear-gradient(135deg,rgba(0,255,200,0.2),rgba(0,170,255,0.2))',
            border:'1px solid rgba(0,255,200,0.4)',
            display:'flex',alignItems:'center',justifyContent:'center',fontSize:18
          }}>🎓</div>
          <div>
            <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:11,fontWeight:700,
              color:'#00ffc8',letterSpacing:2,textTransform:'uppercase'}}>
              Quick Quiz
            </div>
            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:8,color:'#64748b'}}>
              Answer correctly for +75 XP
            </div>
          </div>
        </div>

        {/* Question */}
        <div style={{
          fontFamily:"'Inter',sans-serif",fontSize:14,fontWeight:600,
          color:'#e2e8f0',marginBottom:16,lineHeight:1.5
        }}>
          {activeQuiz.question}
        </div>

        {/* Options */}
        <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:16}}>
          {activeQuiz.options.map((opt, i) => {
            let bg = 'rgba(255,255,255,0.04)'
            let border = 'rgba(255,255,255,0.1)'
            let color = '#cbd5e1'
            if (revealed) {
              if (i === activeQuiz.answer) { bg='rgba(16,185,129,0.15)'; border='#10b981'; color='#10b981' }
              else if (i === selected && !isCorrect) { bg='rgba(239,68,68,0.15)'; border='#ef4444'; color='#ef4444' }
            } else if (selected === i) {
              bg = `${optColors[i]}20`; border = optColors[i]; color = optColors[i]
            }
            return (
              <button key={i} onClick={() => handleSelect(i)} disabled={revealed}
                style={{
                  background:bg, border:`1px solid ${border}`, borderRadius:8,
                  padding:'10px 14px', cursor:revealed?'default':'pointer',
                  display:'flex',alignItems:'center',gap:10,transition:'all 0.2s',
                  textAlign:'left'
                }}>
                <div style={{
                  width:22,height:22,borderRadius:4,border:`1px solid ${border}`,
                  display:'flex',alignItems:'center',justifyContent:'center',
                  fontFamily:"'Orbitron',sans-serif",fontSize:9,color,flexShrink:0
                }}>
                  {revealed && i===activeQuiz.answer ? '✓' : revealed && i===selected && !isCorrect ? '✗' : String.fromCharCode(65+i)}
                </div>
                <span style={{fontFamily:"'Inter',sans-serif",fontSize:12,color,lineHeight:1.4}}>
                  {opt}
                </span>
              </button>
            )
          })}
        </div>

        {/* Fun Fact (shown after answer) */}
        {revealed && (
          <div style={{
            background: isCorrect ? 'rgba(16,185,129,0.1)' : 'rgba(59,130,246,0.1)',
            border: `1px solid ${isCorrect ? '#10b981' : '#3b82f6'}40`,
            borderRadius:8,padding:'10px 14px',
            animation:'fadeInUp 0.3s ease',marginBottom:14
          }}>
            <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:8,
              color: isCorrect ? '#10b981' : '#3b82f6',letterSpacing:1,marginBottom:4}}>
              {isCorrect ? '✅ CORRECT! +75 XP' : '❌ INCORRECT'}
            </div>
            <div style={{fontFamily:"'Inter',sans-serif",fontSize:11,
              color:'#94a3b8',lineHeight:1.5}}>
              {activeQuiz.funFact}
            </div>
          </div>
        )}

        <button onClick={closeQuiz} className="cyber-btn" style={{
          width:'100%',padding:'8px',fontSize:10,
          borderColor:'#00ffc8',color:'#00ffc8'
        }}>
          {revealed ? 'Continue Building →' : 'Skip Quiz'}
        </button>
      </div>
    </div>
  )
}

/**
 * AchievementPopup — slides in from top-right when an achievement unlocks.
 */
export function AchievementPopup() {
  const { showAchievement, dismissAchievement } = useLabStore()
  if (!showAchievement) return null
  return (
    <div onClick={dismissAchievement} style={{
      position:'fixed',top:80,right:20,zIndex:300,
      cursor:'pointer',
    }}>
      <div className="glass-panel achievement-popup" style={{
        padding:'12px 18px',minWidth:280,
        border:'2px solid #f59e0b',
        boxShadow:'0 0 30px rgba(245,158,11,0.4)',
        display:'flex',alignItems:'center',gap:14
      }}>
        <div style={{fontSize:32}}>{showAchievement.icon}</div>
        <div>
          <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:8,
            color:'#f59e0b',letterSpacing:2,textTransform:'uppercase',marginBottom:2}}>
            🏅 Achievement Unlocked!
          </div>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:12,fontWeight:700,
            color:'#fff',marginBottom:2}}>
            {showAchievement.title}
          </div>
          <div style={{fontFamily:"'Inter',sans-serif",fontSize:10,color:'#94a3b8'}}>
            {showAchievement.desc}
          </div>
          <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,
            color:'#f59e0b',marginTop:4}}>
            +{showAchievement.xp} XP
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * XPBar — fixed bottom-center HUD showing level, XP progress, and streak.
 */
export function XPBar() {
  const { xp, level, installStreak, achievements } = useLabStore()
  const xpForLevel = level * 300
  const xpBase = (level - 1) * 300
  const pct = Math.min(((xp - xpBase) / 300) * 100, 100)

  return (
    <div style={{
      position:'fixed',bottom:16,left:'50%',transform:'translateX(-50%)',
      zIndex:25,display:'flex',alignItems:'center',gap:10,
      pointerEvents:'none'
    }}>
      <div className="glass-panel" style={{
        padding:'6px 14px',display:'flex',alignItems:'center',gap:12,
        border:'1px solid rgba(245,158,11,0.3)'
      }}>
        {/* Level badge */}
        <div className="level-badge-pop" style={{
          width:32,height:32,borderRadius:6,
          background:'linear-gradient(135deg,#f59e0b,#fbbf24)',
          display:'flex',alignItems:'center',justifyContent:'center',
          fontFamily:"'Orbitron',sans-serif",fontSize:12,fontWeight:900,color:'#000'
        }}>{level}</div>

        {/* XP bar */}
        <div>
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:3}}>
            <span style={{fontFamily:"'Orbitron',sans-serif",fontSize:7,
              color:'#f59e0b',letterSpacing:1}}>LEVEL {level}</span>
            <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:7,
              color:'#64748b'}}>{xp} / {xpForLevel} XP</span>
          </div>
          <div style={{width:160,height:4,background:'rgba(245,158,11,0.15)',borderRadius:2,overflow:'hidden'}}>
            <div style={{
              height:'100%',width:`${pct}%`,borderRadius:2,
              background:'linear-gradient(90deg,#f59e0b,#00ffc8)',
              transition:'width 0.5s ease',
              boxShadow:'0 0 8px rgba(245,158,11,0.6)'
            }}/>
          </div>
        </div>

        {/* Streak */}
        {installStreak >= 2 && (
          <div style={{display:'flex',alignItems:'center',gap:4}}>
            <span style={{fontSize:14}}>🔥</span>
            <div>
              <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:8,
                color:'#fb923c',fontWeight:700}}>{installStreak}x</div>
              <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:6,color:'#64748b'}}>STREAK</div>
            </div>
          </div>
        )}

        {/* Achievement count */}
        <div style={{display:'flex',alignItems:'center',gap:4,borderLeft:'1px solid rgba(255,255,255,0.08)',paddingLeft:10}}>
          <span style={{fontSize:12}}>🏅</span>
          <div>
            <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:9,
              color:'#fbbf24',fontWeight:700}}>{achievements.length}</div>
            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:6,color:'#64748b'}}>
              /{ACHIEVEMENTS.length}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * AchievementsList — compact achievement tracker panel (used in sidebar or modal)
 */
export function AchievementsList() {
  const { achievements } = useLabStore()
  return (
    <div style={{display:'flex',flexDirection:'column',gap:6}}>
      {ACHIEVEMENTS.map(ach => {
        const unlocked = achievements.includes(ach.id)
        return (
          <div key={ach.id} style={{
            display:'flex',alignItems:'center',gap:10,
            padding:'6px 8px',borderRadius:6,
            background: unlocked ? 'rgba(245,158,11,0.08)' : 'rgba(255,255,255,0.02)',
            border: `1px solid ${unlocked ? 'rgba(245,158,11,0.3)' : 'rgba(255,255,255,0.05)'}`,
            opacity: unlocked ? 1 : 0.5,
            transition:'all 0.3s'
          }}>
            <span style={{fontSize:16,filter:unlocked?'none':'grayscale(1)'}}>{ach.icon}</span>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:8,fontWeight:700,
                color: unlocked ? '#f59e0b' : '#64748b',letterSpacing:0.5}}>
                {ach.title}
              </div>
              <div style={{fontFamily:"'Inter',sans-serif",fontSize:7,color:'#475569',
                overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                {ach.desc}
              </div>
            </div>
            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:7,
              color: unlocked ? '#f59e0b' : '#475569',flexShrink:0}}>
              {unlocked ? `+${ach.xp}` : `${ach.xp}xp`}
            </div>
          </div>
        )
      })}
    </div>
  )
}
