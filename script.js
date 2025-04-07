class PlayerManager {
    constructor() {
        this.players = JSON.parse(localStorage.getItem('players')) || [];
        this.form = document.getElementById('playerForm');
        this.playersList = document.getElementById('playersList');
        this.modal = document.getElementById('passwordModal');
        // Storing hashed password (this is a hash of "admin123")
        this.hashedPassword = '0a7d9bf9bc4a9045f3c9c6d94cc45d40e8bb4c9f3ecb485ddb2ba73e94b6f192';
        this.selectedPlayerId = null;
        
        this.form.addEventListener('submit', (e) => this.addPlayer(e));
        this.renderPlayers();
    }

    addPlayer(e) {
        e.preventDefault();
        
        const player = {
            id: Date.now(),
            name: document.getElementById('playerName').value,
            matches: parseInt(document.getElementById('matches').value),
            runs: parseInt(document.getElementById('runs').value),
            wickets: parseInt(document.getElementById('wickets').value)
        };

        this.players.push(player);
        this.savePlayers();
        this.renderPlayers();
        this.form.reset();
    }

    deletePlayer(id) {
        this.selectedPlayerId = id;
        this.showModal();
    }

    editPlayer(id) {
        this.selectedPlayerId = id;
        this.showModal();
    }

    showModal() {
        this.modal.style.display = 'block';
        document.getElementById('adminPassword').value = '';
    }

    closeModal() {
        this.modal.style.display = 'none';
        this.selectedPlayerId = null;
    }

    async hashPassword(password) {
        const msgBuffer = new TextEncoder().encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        return hashHex;
    }

    async verifyPassword() {
        const password = document.getElementById('adminPassword').value;
        const hashedInput = await this.hashPassword(password);
        
        if (hashedInput === this.hashedPassword) {
            if (this.selectedPlayerId) {
                const action = event.target.closest('button').textContent;
                if (action === 'Delete') {
                    this.confirmDelete(this.selectedPlayerId);
                } else {
                    this.confirmEdit(this.selectedPlayerId);
                }
            }
            this.closeModal();
        } else {
            alert('Incorrect password!');
        }
    }

    confirmDelete(id) {
        this.players = this.players.filter(player => player.id !== id);
        this.savePlayers();
        this.renderPlayers();
    }

    confirmEdit(id) {
        const player = this.players.find(p => p.id === id);
        if (player) {
            document.getElementById('playerName').value = player.name;
            document.getElementById('matches').value = player.matches;
            document.getElementById('runs').value = player.runs;
            document.getElementById('wickets').value = player.wickets;
            
            this.confirmDelete(id);
        }
    }

    savePlayers() {
        localStorage.setItem('players', JSON.stringify(this.players));
    }

    renderPlayers() {
        this.playersList.innerHTML = '';
        
        this.players.forEach(player => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${player.name}</td>
                <td>${player.matches}</td>
                <td>${player.runs}</td>
                <td>${player.wickets}</td>
                <td>
                    <button class="edit-btn" onclick="playerManager.editPlayer(${player.id})">Edit</button>
                    <button class="delete-btn" onclick="playerManager.deletePlayer(${player.id})">Delete</button>
                </td>
            `;
            this.playersList.appendChild(row);
        });
    }
}

const playerManager = new PlayerManager();