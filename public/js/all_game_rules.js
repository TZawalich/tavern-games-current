const liarsDiceRules = `
    <h2>Liar's Dice Game Rules</h2>
    <h4>
        Liar's Dice is a game of dice rolling and deception -- the goal of which is to either 
        trick your opponents into falsely accusing you of a lie, or to catch them in a lie.
    </h4>
    <h3>General Rules</h3>
    <ul>
        <li>The goal of the game is to "bid" the highest number of and value of dice 
            on the table (under ALL cups, not just your own) without going over either
            the value or number of dice. 
        </li>
        <li>
            You win a round by correctly accusing the player before you of overbidding
            on number of and value of dice on the table OR by being accused while having
            made a truthful bid.
        </li>
        <li>Each player will start with five (5) dice</li>
        <li>Ones (1's) are WILD (they count as any dice value)</li>
        <li>The game will end when only one player has dice remaining</li>
        <li><b>
            These games are a work in progress (alpha), if a player leaves the game, it will reset the game 
            table back to the player picking screen.
        </b></li>
        <li>Give me a shout if you find any bugs.</li>
    </ul>
    <h3>Step-by-Step Instructions</h3>
    <ol>
        <li>Each player will "pick a spot" to lock themselves into the game</li>
        <li>Once the game has started, each player will roll their dice to determine play order</li>
        <li>If you so choose, each player may make a monetary (gold, treasure, etc). bid verbally or in the chat window.</li>
        <li>Each player will make their <b>Secret Roll</b>, revealing their dice only to themselves</li>
        <li>The first player is then able to <b>bid</b> the number and value of dice they believe are on the entire table,
        this includes the dice under their own cup as well as the dice under each of their opponents cups.</li>
        <li>The next player then has two options. They may either up the bid, by raising the value of the dice, raising the 
            amount of dice, or raising both. If the player chooses to raise the amount of dice they believe are on the table,
            they may choose any value of the dice. (i.e. raising from four(4) threes(3's) to five(5) twos(2's) is perfectly
            valid).
            <br>
            They may also accuse the previous player of <b>lying</b> by challening their bid and
            claiming that they have overbid on the number and value of the dice in play.
        </li>
        <li>Once an accusation occurs, the round will end and if the accusor is wrong, they will lose one (1) die.
            If they are correct, and the previous player overbid, the previous player (the accused) will lose one (1) die.
        </li>
        <li>The game will end when only one player has dice remaining</li>
    </ol>
`
const dragonsHoardRules = `
    <h2>Dragon's Hoard Game Rules</h2>
    <h4>
    Dragon's Hoard is a simple game of dice rolling and placing or collecting gold coins
    from the game board.
    </h4>
    <h2>General Rules</h2>
    <ul>
        <li>You will roll your dice (2d6) and either place or collect gold coins from  the game board 
            depending on how your roll.
        </li>
        <li>Rolling a two (2) or "The Dragon's Eyes" means you place 1 gold piece on each game board spot.
            You will not collect any coins regardles of how many gold pieces are on each spot.
        </li>
        <li>Rolling a twelve (12) or "The Dragon's Hoard" allows you to collect all gold pieces on the board</li>
        <li>Rolling anywhere between three (3) and eleven (11) means you place one gold piece on the corresponding table spot. 
            If there are three or more (3 or 3+) tokens on the space, you take them instead.
        </li>
        <li>When finished, pay your debts (or collect your winnings) from your Dungeon Master or any nearby Goblin Innkeeper.</li>
        <li><b>
            These games are a work in progress (alpha), if a player leaves the game, it will reset the game 
            table back to the player picking screen.
        </b></li>
        <li>Give me a shout if you find any bugs.</li>
    </ul>
`

document.getElementById("game_rules_wrapper").addEventListener("click", () => { toggleRules() })

document.getElementById('game_rules_close').addEventListener("click", () => { toggleRules() })

document.getElementById("game_rules_button_dragons_hoard").addEventListener("click", () => {
    document.getElementById("game_rules_inner").innerHTML = Mustache.render(dragonsHoardRules);
    toggleRules()
})

document.getElementById("game_rules_button_liars_dice").addEventListener("click", () => {
    document.getElementById("game_rules_inner").innerHTML = Mustache.render(liarsDiceRules);
    toggleRules()
})

document.getElementById("game_rules").addEventListener("click", (e) => { e.stopPropagation() })

const toggleRules = () => document.getElementById('game_rules_wrapper').classList.toggle('hidden');