import React, { useState, useRef } from 'react';
import { Mic, Square, Play, Pause, Trash2, Radio } from 'lucide-react';
import { VoiceRecorder, soundEngine } from '../../services/audioService';
import { useJournal } from '../../context/JournalContext';
import { supabaseUploadMedia } from '../../services/supabaseService';

export const VoiceRecorderWidget = ({ pageId, accent = '#6c63ff' }) => {
  const { addVoiceNoteToPage, canWrite } = useJournal();
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const recorderRef = useRef(null);
  const timerRef = useRef(null);

  const accentLight = `${accent}15`;
  const accentMid   = `${accent}30`;

  const startRecording = async () => {
    try {
      soundEngine.initContext();
      recorderRef.current = new VoiceRecorder();
      await recorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => setRecordingTime(p => p + 1), 1000);
    } catch (err) {
      alert('Microphone error: ' + err.message);
    }
  };

  const stopRecording = async () => {
    if (!recorderRef.current) return;
    clearInterval(timerRef.current);
    const audioData = await recorderRef.current.stop();
    setIsRecording(false);
    
    try {
      const path = `voice_${Date.now()}.webm`;
      const url = await supabaseUploadMedia(audioData.blob, path);
      
      addVoiceNoteToPage(pageId, {
        id: 'voice-' + Date.now(),
        date: new Date().toISOString().replace('T', ' ').substring(0, 16),
        duration: recordingTime || 5,
        url: url,
      });
    } catch (err) {
      alert("Failed to upload voice note: " + err.message);
    }
    
    setRecordingTime(0);
  };

  if (!canWrite) return null;

  return (
    <div className="inline-block">
      {isRecording ? (
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-[8px] text-xs font-medium animate-pulse"
          style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.35)', color: '#ef4444' }}
        >
          <Radio size={12} className="animate-spin" />
          <span>Rec ({recordingTime}s)</span>
          <button
            onClick={stopRecording}
            className="w-5 h-5 rounded-full flex items-center justify-center ml-1"
            style={{ background: '#ef4444', color: '#fff' }}
            title="Stop Recording"
          >
            <Square size={8} />
          </button>
        </div>
      ) : (
        <button
          onClick={startRecording}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-[11px] font-medium transition-all"
          style={{ background: 'rgba(0,0,0,0.06)', border: '1px solid var(--parchment-line)', color: 'var(--ink-mid)' }}
          onMouseEnter={e => { e.currentTarget.style.background = accentLight; e.currentTarget.style.color = accent; e.currentTarget.style.borderColor = accentMid; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.06)'; e.currentTarget.style.color = 'var(--ink-mid)'; e.currentTarget.style.borderColor = 'var(--parchment-line)'; }}
          title="Record Voice Note"
        >
          <Mic size={12} />
          <span>Voice Note</span>
        </button>
      )}
    </div>
  );
};

// Voice Note Player
export const VoiceNotePlayer = ({ note, pageId, canWrite, accent = '#6c63ff' }) => {
  const { deleteVoiceNoteFromPage } = useJournal();
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  const accentLight = `${accent}15`;

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) { audioRef.current.pause(); setIsPlaying(false); }
    else            { audioRef.current.play();  setIsPlaying(true);  }
  };

  return (
    <div
      className="my-1 p-2.5 rounded-[10px] flex items-center justify-between gap-3 w-full max-w-xs"
      style={{ background: accentLight, border: `1px solid ${accent}22`, color: 'var(--ink-mid)' }}
    >
      <audio ref={audioRef} src={note.url} onEnded={() => setIsPlaying(false)} className="hidden" />

      <button
        onClick={togglePlay}
        className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-white transition-all active:scale-95"
        style={{ background: accent }}
        title={isPlaying ? "Pause" : "Play"}
      >
        {isPlaying ? <Pause size={12} /> : <Play size={12} className="ml-0.5" />}
      </button>

      <div className="flex-grow min-w-0">
        <div className="flex justify-between text-[10px] mb-1" style={{ color: 'var(--ink-light)', fontFamily: 'Inter, monospace' }}>
          <span>Voice Note</span>
          <span>{note.duration}s</span>
        </div>
        <div className="flex items-end gap-0.5 h-3">
          {[40, 70, 30, 90, 50, 80, 40, 100, 60, 30].map((h, i) => (
            <div
              key={i}
              className="w-1 rounded-full transition-all duration-300"
              style={{
                height: `${h}%`,
                background: isPlaying ? accent : `${accent}55`,
                animation: isPlaying ? `pulse 0.${6 + i % 4}s ease-in-out infinite alternate` : 'none',
              }}
            />
          ))}
        </div>
      </div>

      {canWrite && (
        <button
          onClick={() => deleteVoiceNoteFromPage(pageId, note.id)}
          className="p-1 transition-colors shrink-0"
          style={{ color: 'var(--ink-light)' }}
          onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--ink-light)'}
          title="Delete Voice Note"
        >
          <Trash2 size={12} />
        </button>
      )}
    </div>
  );
};
