// 使用Web Audio API创建音效
const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioContext = new AudioContext();

// 创建正确答案的音效
function createCorrectSound() {
    return new Promise(resolve => {
        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
        oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.2); // E5
        oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.4); // G5
        
        gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.6);
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.6);
        
        setTimeout(resolve, 600);
    });
}

// 创建错误答案的音效
function createWrongSound() {
    return new Promise(resolve => {
        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(392.00, audioContext.currentTime); // G4
        oscillator.frequency.setValueAtTime(349.23, audioContext.currentTime + 0.2); // F4
        
        gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.4);
        
        setTimeout(resolve, 400);
    });
}

// 导出音效函数
const sounds = {
    playCorrectSound: createCorrectSound,
    playWrongSound: createWrongSound
};