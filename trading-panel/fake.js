// Fake candle generator

class FakeDataGenerator {
    constructor() {
        this.currentStep = 0;
        this.isRunning = false;
        
        // Load complex sequence by default
        this.loadSequence('simple');
    }
    
    // Load a sequence from JS file
    loadSequence(sequenceName) {
        // Check if sequence is available as global variable
        const sequenceVar = window[sequenceName + 'Sequence'];
        if (sequenceVar) {
            this.baseState = sequenceVar.baseState;
            this.stepChanges = sequenceVar.stepChanges;
            this.currentSequence = sequenceName;
            console.log(`Loaded sequence: ${sequenceVar.name}`);
            
            // Reset to step 0 to show the base candle
            this.currentStep = 0;
        } else {
            console.error(`Sequence ${sequenceName} not found`);
        }
    }

    buildStateForStep(step) {
        // Start with base state
        const state = this.baseState.map(candle => ({...candle}));
        
        // Apply all changes up to this step
        for (let i = 0; i <= step; i++) {
            const changes = this.stepChanges[i];
            Object.keys(changes).forEach(candleIndex => {
                const idx = parseInt(candleIndex);
                if (idx >= state.length) {
                    // Add new candle
                    state.push({...changes[candleIndex]});
                } else {
                    // Update existing candle
                    Object.assign(state[idx], changes[candleIndex]);
                }
            });
        }
        
        return { candles: state };
    }

    getNextStep() {
        if (this.currentStep >= this.stepChanges.length - 1) {
            this.isRunning = false;
            return null;
        }
        
        this.currentStep++;
        return this.buildStateForStep(this.currentStep);
    }

    start() {
        this.isRunning = true;
    }

    stop() {
        this.isRunning = false;
    }

    reset() {
        this.currentStep = 0;
        this.isRunning = false;
    }

    isComplete() {
        return this.currentStep >= this.stepChanges.length - 1;
    }

    getProgress() {
        return {
            current: this.currentStep,
            total: this.stepChanges.length - 1,
            percentage: Math.round((this.currentStep / (this.stepChanges.length - 1)) * 100)
        };
    }

    jumpToStep(targetStep) {
        this.currentStep = Math.max(0, Math.min(targetStep, this.stepChanges.length - 1));
        return this.buildStateForStep(this.currentStep);
    }

    getCurrentStepData() {
        return this.buildStateForStep(this.currentStep);
    }
}

// Available sequences array
const availableSequences = [
    { name: 'simple', displayName: 'Simple Test', description: 'Basic price movement test' },
    { name: 'medium', displayName: 'Medium Test', description: 'Extended price movement with multiple candles' },
    { name: 'complex', displayName: 'Complex Test', description: 'Complex price movement with many candles and dramatic swings' }
];

// Global fake data generator
let fakeData = new FakeDataGenerator();
