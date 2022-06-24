const COLOR_SQUARES = '🟩 🟥 🟦 🟧 ⬛️ 🟨 🟪 ⬜️ 🟫'.split(' ');
function* getColorSquare(): Generator<string> {
    for (let i = 0; true; i++) {
        yield COLOR_SQUARES[i % COLOR_SQUARES.length] as string;
    }
}

export const colorSquare = getColorSquare();
