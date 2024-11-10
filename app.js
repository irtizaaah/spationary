// Main application namespace
const BlocklyApp = {
    workspace: null,
    instructions: [],

    // Initialize the application
    init() {
        this.initBlocklyBlocks();
        this.initBlocklyWorkspace();
        this.initEventListeners();
    },

    // Initialize custom Blockly blocks
    initBlocklyBlocks() {
        const movements = ['right', 'left', 'forward', 'backward'];
        
        movements.forEach(direction => {
            // Define block
            Blockly.Blocks[`move_${direction}`] = {
                init: function() {
                    this.appendDummyInput()
                        .appendField(`Move ${direction.charAt(0).toUpperCase() + direction.slice(1)}`);
                    this.setPreviousStatement(true, null);
                    this.setNextStatement(true, null);
                    this.setColour(160);
                    this.setTooltip(`Move ${direction} one step`);
                }
            };

            // Define JavaScript generator
            Blockly.JavaScript[`move_${direction}`] = () => {
                return `BlocklyApp.instructions.push("${direction}");\n`;
            };
        });
    },

    // Initialize Blockly workspace
    initBlocklyWorkspace() {
        this.workspace = Blockly.inject('blocklyDiv', {
            toolbox: document.getElementById('toolbox'),
            scrollbars: true,
            grid: {
                spacing: 20,
                length: 3,
                colour: '#ccc',
                snap: true
            },
            zoom: {
                controls: true,
                wheel: true,
                startScale: 1.0,
                maxScale: 3,
                minScale: 0.3,
                scaleSpeed: 1.2
            }
        });
    },

    // Initialize event listeners
    initEventListeners() {
        this.workspace.addChangeListener(event => {
            if (event.type === Blockly.Events.BLOCK_CREATE) {
                console.log('Block created:', event.blockId);
            }
        });
    },

    // Run the generated code
    async runCode() {
        this.instructions = [];
        this.clearOutput();
        
        const code = Blockly.JavaScript.workspaceToCode(this.workspace);
        
        try {
            await eval('(async () => { ' + code + ' })()');
            this.appendToOutput(JSON.stringify(this.instructions, null, 2));
            await this.sendInstructions(this.instructions);
        } catch (error) {
            this.appendToOutput(`Error: ${error.message}`);
        }
    },

    // Show generated JavaScript code
    showCode() {
        const code = Blockly.JavaScript.workspaceToCode(this.workspace);
        document.getElementById('codeDisplay').textContent = code;
    },

    // Send instructions to server
    async sendInstructions(instructions) {
        try {
            const response = await fetch('http://localhost:3001/receive-instructions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ instructions })
            });

            const result = await response.json();
            console.log(result.status === 'success' ? 
                'Instructions sent successfully' : 
                `Error: ${result.message}`
            );
        } catch (error) {
            console.error('Failed to send instructions:', error);
            this.appendToOutput('Failed to send instructions to server');
        }
    },

    // Output handling
    clearOutput() {
        document.getElementById('outputDiv').innerHTML = '';
    },

    appendToOutput(text) {
        const outputDiv = document.getElementById('outputDiv');
        outputDiv.innerHTML += text + '<br>';
    }
};

// Initialize the application when the page loads
window.addEventListener('load', () => BlocklyApp.init());
