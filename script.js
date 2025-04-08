class PlayerManager {
    constructor() {
        // Initialize Supabase client
        this.supabase = supabase.createClient(
            'https://yldfgikmduqtgbutjvqd.supabase.co',  // Your Project URL
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlsZGZnaWttZHVxdGdidXRqdnFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQwODIxNzcsImV4cCI6MjA1OTY1ODE3N30.KLJXy0qOfSYl9xm4WBGbn9IXGHJBohpCUPS43tjFmDM'
        );
        
        this.form = document.getElementById('playerForm');
        this.playersList = document.getElementById('playersList');
        this.modal = document.getElementById('passwordModal');
        this.hashedPassword = '1e0cad1db1a7387cd0ced57eab556e1027d07746a55d5c2c567c823a68d90a5c';
        this.selectedPlayerId = null;
        this.showAddFormBtn = document.getElementById('showAddForm');
        
        this.form.addEventListener('submit', (e) => this.addPlayer(e));
        this.showAddFormBtn.addEventListener('click', () => this.showAddPlayerForm());
        this.loadPlayers();
    }

    async loadPlayers() {
        try {
            const { data, error } = await this.supabase
                .from('players')
                .select('*')
                .order('name');
            
            if (error) throw error;
            this.players = data;
            this.renderPlayers();
        } catch (error) {
            console.error('Error loading players:', error);
            alert('Failed to load players');
        }
    }

    // Add this method for password hashing
    async hashPassword(password) {
        const msgBuffer = new TextEncoder().encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        return hashHex;
    }

    // Fix the addPlayer method to check for duplicates
    async addPlayer(e) {
        e.preventDefault();
        
        const playerName = document.getElementById('playerName').value;
        
        // Check if player already exists
        const { data: existingPlayer } = await this.supabase
            .from('players')
            .select('id')
            .eq('name', playerName)
            .single();

        if (existingPlayer) {
            alert('Player already exists! Please use edit instead.');
            return;
        }

        const player = {
            name: playerName,
            matches: parseInt(document.getElementById('matches').value),
            runs: parseInt(document.getElementById('runs').value),
            wickets: parseInt(document.getElementById('wickets').value)
        };

        try {
            const { data, error } = await this.supabase
                .from('players')
                .insert([player])
                .select();

            if (error) throw error;
            
            await this.loadPlayers();
            this.form.reset();
            this.form.style.display = 'none';
            this.showAddFormBtn.style.display = 'block';
        } catch (error) {
            console.error('Error adding player:', error);
            alert('Failed to add player');
        }
    }

    async confirmDelete(id) {
        try {
            const { error } = await this.supabase
                .from('players')
                .delete()
                .eq('id', id);

            if (error) throw error;
            await this.loadPlayers();
        } catch (error) {
            console.error('Error deleting player:', error);
            alert('Failed to delete player');
        }
    }

    // Fix the confirmEdit method
    async confirmEdit(id) {
        const player = this.players.find(p => p.id === id);
        if (player) {
            const updatedPlayer = {
                name: document.getElementById('playerName').value,
                matches: parseInt(document.getElementById('matches').value),
                runs: parseInt(document.getElementById('runs').value),
                wickets: parseInt(document.getElementById('wickets').value)
            };
            
            try {
                const { error } = await this.supabase
                    .from('players')
                    .update(updatedPlayer)
                    .eq('id', id);

                if (error) throw error;
                await this.loadPlayers();
                this.form.reset();
            } catch (error) {
                console.error('Error updating player:', error);
                alert('Failed to update player');
            }
        }
    }

    // Fix the showAddPlayerForm method
    showAddPlayerForm() {
        this.selectedPlayerId = 'add';
        this.showModal();
    }

    async verifyPassword() {
        const password = document.getElementById('adminPassword').value;
        const hashedInput = await this.hashPassword(password);
        
        if (hashedInput === this.hashedPassword) {
            if (this.selectedPlayerId === 'add') {
                this.form.style.display = 'grid';
                this.showAddFormBtn.style.display = 'none';
            } else if (this.selectedPlayerId) {
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

    closeModal() {
        this.modal.style.display = 'none';
        if (this.selectedPlayerId !== 'add') {
            this.selectedPlayerId = null;
        }
    }
}

const playerManager = new PlayerManager();