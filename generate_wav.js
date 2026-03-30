const fs = require('fs');
const sampleRate = 44100;
const duration = 0.5;
const numSamples = duration * sampleRate;
const buffer = Buffer.alloc(44 + numSamples * 2);

buffer.write('RIFF', 0);
buffer.writeUInt32LE(36 + numSamples * 2, 4);
buffer.write('WAVE', 8);
buffer.write('fmt ', 12);
buffer.writeUInt32LE(16, 16);
buffer.writeUInt16LE(1, 20);
buffer.writeUInt16LE(1, 22);
buffer.writeUInt32LE(sampleRate, 24);
buffer.writeUInt32LE(sampleRate * 2, 28);
buffer.writeUInt16LE(2, 32);
buffer.writeUInt16LE(16, 34);
buffer.write('data', 36);
buffer.writeUInt32LE(numSamples * 2, 40);

for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const value = Math.round(Math.sin(2 * Math.PI * 440 * t) * 32767);
    buffer.writeInt16LE(value, 44 + i * 2); // 16-bit PCM
}
fs.writeFileSync('f:/My_Projects/MoonBeat/assets/beep.wav', buffer);
console.log("16-bit WAV generated");
