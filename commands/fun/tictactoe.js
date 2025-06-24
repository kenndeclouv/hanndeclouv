const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('tictactoe')
    .setDescription('main tictactoe bareng temen atau bot!')
    .addStringOption(option =>
      option.setName('mode')
        .setDescription('pilih mode permainan')
        .setRequired(true)
        .addChoices(
          { name: 'versus player', value: 'player' },
          { name: 'versus bot (easy)', value: 'bot_easy' },
          { name: 'versus bot (medium)', value: 'bot_medium' },
          { name: 'versus bot (hard)', value: 'bot_hard' }
        )
    )
    .addUserOption(option => option.setName('player').setDescription('player yang mau diajak main')),

  async execute(interaction) {
    const mode = interaction.options.getString('mode');
    const playerX = interaction.user;
    let playerO = interaction.options.getUser('player');
    let botMode = false;
    let botDifficulty = mode;

    if (mode === 'player') {
      if (!playerO) return interaction.reply({ content: 'pilih playernya dulu yaa 😋', ephemeral: true });
      if (playerO.bot) return interaction.reply({ content: 'gabisaa ngajak bot main😭', ephemeral: true });
      if (playerO.id === playerX.id) return interaction.reply({ content: 'gabisaa main sama diri sendiri 😋', ephemeral: true });
    } else {
      botMode = true;
      playerO = interaction.client.user;
    }

    let board = ['⬜', '⬜', '⬜', '⬜', '⬜', '⬜', '⬜', '⬜', '⬜'];
    let currentPlayer = playerX;
    let message;

    const getBoard = () => {
      return `\`\`\`${board[0]} | ${board[1]} | ${board[2]}\n` +
        `—————————————\n` +
        `${board[3]} | ${board[4]} | ${board[5]}\n` +
        `—————————————\n` +
        `${board[6]} | ${board[7]} | ${board[8]}\`\`\``;
    };

    const checkWin = (symbol) => {
      const winPatterns = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
      ];
      return winPatterns.some(pattern => pattern.every(index => board[index] === symbol));
    };

    const checkDraw = () => board.every(cell => cell !== '⬜');

    const createButtons = () => {
      const rows = [];
      for (let i = 0; i < 3; i++) {
        const row = new ActionRowBuilder();
        for (let j = 0; j < 3; j++) {
          const index = i * 3 + j;
          row.addComponents(
            new ButtonBuilder()
              .setCustomId(index.toString())
              .setLabel(board[index])
              // .setStyle(ButtonStyle.Secondary)
              .setStyle(board[index] === '❌' ? ButtonStyle.Danger : board[index] === '⭕' ? ButtonStyle.Primary : ButtonStyle.Secondary)
              .setDisabled(board[index] !== '⬜')
          );
        }
        rows.push(row);
      }
      return rows;
    };

    const rematchRow = () => {
      return new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('rematch')
          .setLabel('Rematch 🔁')
          .setStyle(ButtonStyle.Success)
      );
    };

    const startGame = async () => {
      const embed = new EmbedBuilder()
        .setTitle('> ⭕ Tic Tac Toe ❌')
        .setDescription(getBoard())
        .addFields({ name: 'Giliran', value: `${currentPlayer} 🔄` })
        .setFooter({ text: `Mode: ${mode === 'player' ? 'Versus Player' : botDifficulty.replace('bot_', 'Bot - ').toUpperCase()}` })
        // .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
        .setColor('Blue');

      message = await message?.edit({ embeds: [embed], components: createButtons(), fetchReply: true }) || await interaction.reply({ embeds: [embed], components: createButtons(), fetchReply: true });

      const collector = message.createMessageComponentCollector({ time: 120000 });

      collector.on('collect', async i => {
        if (i.customId === 'rematch') return;

        if (i.user.id !== currentPlayer.id) {
          return i.reply({ content: 'giliran siapa hayoo😭 tunggu yaa!', ephemeral: true });
        }

        const index = parseInt(i.customId);
        board[index] = currentPlayer.id === playerX.id ? '❌' : '⭕';

        if (checkWin('❌')) {
          collector.stop();
          embed.setDescription(getBoard());
          embed.data.fields = [];
          // embed.addFields({ name: 'Status', value: `🎉 ${currentPlayer} menang!` });
          embed.addFields({ name: '🏆 | Status', value: `🎉 ${currentPlayer} menangg!` });
          return i.update({ embeds: [embed], components: [rematchRow()] });
        }

        if (checkDraw()) {
          collector.stop();
          embed.setDescription(getBoard());
          embed.data.fields = [];
          // embed.addFields({ name: 'Status', value: 'seri yaa 😋' });
          embed.addFields({ name: '🤝 | Status', value: 'seri yaa 😋' });
          return i.update({ embeds: [embed], components: [rematchRow()] });
        }

        if (botMode) {
          currentPlayer = playerO;
          embed.setDescription(getBoard());
          embed.data.fields = [{ name: 'Giliran', value: `${currentPlayer} 🔄` }];
          await i.update({ embeds: [embed], components: createButtons() });

          setTimeout(() => botMove(collector, embed), 1000);
        } else {
          currentPlayer = currentPlayer.id === playerX.id ? playerO : playerX;
          embed.setDescription(getBoard());
          embed.data.fields = [{ name: 'Giliran', value: `${currentPlayer} 🔄` }];
          await i.update({ embeds: [embed], components: createButtons() });
        }
      });

      collector.on('end', async (_, reason) => {
        if (reason === 'time') {
          embed.addFields({ name: 'Status', value: 'game selesai karena kelamaan yaa 😋' });
          try {
            await message.edit({ embeds: [embed], components: [rematchRow()] });
          } catch { }
        }
      });

      const rematchCollector = message.createMessageComponentCollector({ time: 600000 });

      rematchCollector.on('collect', async i => {
        if (i.customId !== 'rematch') return;

        if (i.user.id !== playerX.id && i.user.id !== playerO.id) {
          return i.reply({ content: 'cuma player yang bisa rematch yaa 😋', ephemeral: true });
        }

        await i.deferUpdate();

        board = ['⬜', '⬜', '⬜', '⬜', '⬜', '⬜', '⬜', '⬜', '⬜'];
        currentPlayer = playerX;

        await startGame();
      });
    };

    const botMove = async (collector, embed) => {
      let botChoice;

      if (botDifficulty === 'bot_easy') {
        let emptyCells = board.map((cell, index) => cell === '⬜' ? index : null).filter(index => index !== null);
        botChoice = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      }

      if (botDifficulty === 'bot_medium') {
        botChoice = findWinningMove('⭕') || randomMove();
      }

      if (botDifficulty === 'bot_hard') {
        botChoice = minimax(board, '⭕').index;
      }

      board[botChoice] = '⭕';

      if (checkWin('⭕')) {
        collector.stop();
        embed.setDescription(getBoard());
        embed.data.fields = [];
        embed.addFields({ name: 'Status', value: `😭 botnya menang niii... cobaa lagii yaa!` });
        return await message.edit({ embeds: [embed], components: [rematchRow()] });
      }

      if (checkDraw()) {
        collector.stop();
        embed.setDescription(getBoard());
        embed.data.fields = [];
        embed.addFields({ name: 'Status', value: 'seri yaa 😋' });
        return await message.edit({ embeds: [embed], components: [rematchRow()] });
      }

      currentPlayer = playerX;
      embed.setDescription(getBoard());
      embed.data.fields = [{ name: 'Giliran', value: `${currentPlayer} 🔄` }];
      await message.edit({ embeds: [embed], components: createButtons() });
    };

    const findWinningMove = (symbol) => {
      for (let i = 0; i < board.length; i++) {
        if (board[i] === '⬜') {
          board[i] = symbol;
          if (checkWin(symbol)) {
            board[i] = '⬜';
            return i;
          }
          board[i] = '⬜';
        }
      }
      return null;
    };

    const randomMove = () => {
      let emptyCells = board.map((cell, index) => cell === '⬜' ? index : null).filter(index => index !== null);
      return emptyCells[Math.floor(Math.random() * emptyCells.length)];
    };

    const minimax = (newBoard, player) => {
      const human = '❌';
      const ai = '⭕';
      const availSpots = newBoard.map((cell, index) => cell === '⬜' ? index : null).filter(index => index !== null);

      if (checkWin(human)) return { score: -10 };
      if (checkWin(ai)) return { score: 10 };
      if (availSpots.length === 0) return { score: 0 };

      let moves = [];

      for (let i = 0; i < availSpots.length; i++) {
        let move = {};
        move.index = availSpots[i];
        newBoard[availSpots[i]] = player;

        if (player === ai) {
          let result = minimax(newBoard, human);
          move.score = result.score;
        } else {
          let result = minimax(newBoard, ai);
          move.score = result.score;
        }

        newBoard[availSpots[i]] = '⬜';
        moves.push(move);
      }

      let bestMove;
      if (player === ai) {
        let bestScore = -Infinity;
        for (let i = 0; i < moves.length; i++) {
          if (moves[i].score > bestScore) {
            bestScore = moves[i].score;
            bestMove = i;
          }
        }
      } else {
        let bestScore = Infinity;
        for (let i = 0; i < moves.length; i++) {
          if (moves[i].score < bestScore) {
            bestScore = moves[i].score;
            bestMove = i;
          }
        }
      }

      return moves[bestMove];
    };

    await startGame();
  },
};
