"""Independent check: scan OUTWARD FROM EXISTING FRIENDLY DISCS.

The example scans from a proposed move inward toward a friendly endpoint.
Here we discover candidate empty endpoints from existing anchors instead.
No example or starter rule/lifecycle function is imported by this module.
"""


def capture_map(board: list[list[str]], player: str) -> dict[tuple[int, int], set[tuple[int, int]]]:
    found: dict[tuple[int, int], set[tuple[int, int]]] = {}
    enemy = "W" if player == "B" else "B"
    # A padded, flattened array prevents both horizontal wrapping and bounds errors.
    cells = ["#"] * 100
    for r, row in enumerate(board):
        for c, value in enumerate(row):
            cells[(r+1)*10+c+1] = value
    for anchor, value in enumerate(cells):
        if value != player:
            continue
        for delta in (-11, -10, -9, -1, 1, 9, 10, 11):
            at = anchor + delta
            line = set()
            while cells[at] == enemy:
                line.add((at//10-1, at%10-1))
                at += delta
            if line and cells[at] == ".":
                found.setdefault((at//10-1, at%10-1), set()).update(line)
    return found


def after_move(board, player, key, captures):
    result = [list(row) for row in board]
    result[key[0]][key[1]] = player
    for row, col in captures:
        result[row][col] = player
    return result
