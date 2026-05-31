import { expect, test } from "@playwright/test";
import { openTwoPeers } from "@baditaflorin/mesh-common/testing";
import { readFileSync } from "node:fs";

const pkg = JSON.parse(readFileSync(new URL("../../package.json", import.meta.url), "utf8")) as {
  name: string;
};
const storagePrefix = pkg.name;

/**
 * Load-bearing cross-peer assertion for the advertised core action:
 *
 *   "Everyone shows 1–5 at the same time; the aggregate is a bar chart."
 *
 * Peer A casts a vote (taps cell value 4). Peer B — which never voted —
 * must see that vote reflected in ITS OWN aggregate bar chart, because
 * votes live in a shared `Y.Map<peerId, {value, ts}>` named "votes" that
 * syncs over the mesh. We read the count on the OPPOSITE peer (B) so the
 * test fails if the write never crossed the wire (e.g. if the vote went to
 * React useState instead of the Yjs doc).
 */
test("a vote cast on peer A appears in peer B's aggregate bar chart", async ({
  browser,
  baseURL,
}) => {
  const { a, b, cleanup } = await openTwoPeers(browser, baseURL ?? "", { storagePrefix });
  try {
    // Both peers join the room.
    await a.getByRole("button", { name: /connect/i }).click();
    await b.getByRole("button", { name: /connect/i }).click();

    // The five vote cells are present on both peers once armed.
    await expect(a.locator(".fistoffive-cell")).toHaveCount(5);
    await expect(b.locator(".fistoffive-cell")).toHaveCount(5);

    // Sanity: before A votes, B's chart for value "4" reads 0.
    const bBarFour = b.locator(".fistoffive-bar-col").nth(3).locator(".fistoffive-bar-count");
    await expect(bBarFour).toHaveText("0");

    // Peer A casts a vote of 4 (4th cell, 0-indexed 3).
    await a.locator(".fistoffive-cell").nth(3).click();

    // A sees its own vote highlighted.
    await expect(a.locator(".fistoffive-cell-mine")).toHaveText("4");

    // The load-bearing cross-peer assertion: peer B — which never voted —
    // sees A's vote in its OWN aggregate. The "4" column count must reach 1.
    await expect(bBarFour).toHaveText("1");

    // And B's "1/2/3/5" columns stay at 0 — only the cast value moved.
    for (const idx of [0, 1, 2, 4]) {
      await expect(
        b.locator(".fistoffive-bar-col").nth(idx).locator(".fistoffive-bar-count"),
      ).toHaveText("0");
    }

    // Reciprocal direction: B casts a vote of 2; A must see its count rise.
    await b.locator(".fistoffive-cell").nth(1).click();
    await expect(
      a.locator(".fistoffive-bar-col").nth(1).locator(".fistoffive-bar-count"),
    ).toHaveText("1");
  } finally {
    await cleanup();
  }
});
