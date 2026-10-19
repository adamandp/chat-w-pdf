import { test, expect } from "@playwright/test";
test("chat dropdown stays overlay, edit, feedback and new multipart chat", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Q3 Financial Summary", exact: true }),
  ).toBeVisible();
  const bubble = page.locator(".user .message-bubble");
  await page.screenshot({ path: "/tmp/chat-desktop.png" });
  const before = await bubble.boundingBox();
  await page
    .locator(".page-header")
    .getByRole("button", { name: "Documents" })
    .click();
  await expect(
    page.getByRole("menuitem", { name: /Annual Report 2023/ }),
  ).toBeVisible();
  expect(await bubble.boundingBox()).toEqual(before);
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Edit message", exact: true }).click();
  await page
    .getByRole("textbox", { name: "Edit message", exact: true })
    .fill("Updated financial question");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(bubble).toContainText("Updated financial question");
  await page
    .getByRole("button", { name: "Helpful answer", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText("Thanks");
  await page.getByRole("button", { name: "New Chat", exact: true }).click();
  await page
    .getByRole("textbox", { name: "Message", exact: true })
    .fill("Summarize my report");
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(
    page.getByRole("heading", { name: "Summarize my report", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".assistant")).toContainText("Attach or choose");
});
test("document search, grid, preview fallback, soft delete and restore", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("navigation")
    .getByRole("button", { name: "Documents", exact: true })
    .click();
  await expect(page.locator(".document-card")).toHaveCount(3);
  await page
    .getByRole("textbox", { name: "Search documents" })
    .fill("Financial Analysis");
  await expect(page.locator(".document-card")).toHaveCount(1);
  await page.getByRole("button", { name: "Grid View" }).click();
  await expect(page.locator(".document-grid")).toBeVisible();
  await page.locator(".document-title").click();
  await expect(
    page.getByRole("heading", { name: "Ready for your PDF" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Expand preview" }).click();
  await expect(page.locator(".pdf-preview")).toHaveClass(/expanded/);
  await page.getByRole("button", { name: "Close preview" }).click();
  await page.getByRole("button", { name: "More actions" }).last().click();
  await page.getByRole("menuitem", { name: "Move to Trash" }).click();
  await expect(page.locator(".document-card")).toHaveCount(0);
  await page
    .getByRole("navigation")
    .getByRole("button", { name: "Trash", exact: true })
    .click();
  const row = page.locator(".trash-row").filter({
    has: page.getByRole("heading", {
      name: "Financial Analysis.pdf",
      exact: true,
    }),
  });
  await expect(row).toBeVisible();
  await row.getByRole("button", { name: "Restore" }).click();
  await expect(row).toHaveCount(0);
});
test("mobile drawer and screens fit without horizontal overflow", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Q3 Financial Summary", exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(390);
  await page.screenshot({ path: "/tmp/chat-mobile.png" });
  await page.getByRole("button", { name: "Open navigation" }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Documents", exact: true })
    .click();
  await expect(page.locator(".document-card")).toHaveCount(3);
  await page.getByRole("button", { name: "Grid View" }).click();
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(390);
  await page.screenshot({ path: "/tmp/documents-mobile.png" });
});

test("mock contract supports rename, multipart upload, edit, feedback and both deletion modes", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Q3 Financial Summary", exact: true }),
  ).toBeVisible();
  const result = await page.evaluate(async () => {
    const request = async (path: string, method = "GET", body?: object) => {
      const response = await fetch("/api" + path, {
        method,
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      });
      return {
        status: response.status,
        data: response.status === 204 ? null : await response.json(),
      };
    };
    const active = await request("/sessions");
    const docs = await request("/documents");
    const deleted = await request("/sessions?deleted=true");
    const deletedDocs = await request("/documents?deleted=true");
    const related = await request("/sessions/session-1/documents");
    const chats = await request("/sessions/session-1/chats");
    const renamed = await request("/sessions/session-1", "PATCH", {
      title: "Renamed review",
    });
    const form = new FormData();
    form.append("sessionId", "");
    form.append("message", "Review uploaded PDF");
    form.append("mode", "Document Only");
    form.append("documentIds", "[]");
    form.append(
      "document",
      new File(["%PDF-1.4\n%%EOF"], "test-upload.pdf", {
        type: "application/pdf",
      }),
    );
    const sendResponse = await fetch("/api/chats", {
      method: "POST",
      body: form,
    });
    const sent = await sendResponse.json();
    const edited = await request(`/chats/${sent.messages[0].id}/edit`, "POST", {
      message: "Updated upload question",
    });
    const feedback = await request("/feedback", "POST", {
      messageId: sent.messages[1].id,
      rating: "up",
    });
    const sessionSoft = await request(`/sessions/${sent.session.id}`, "DELETE");
    const afterSoft = await request("/sessions?deleted=true");
    const sessionRestore = await request(
      `/sessions/${sent.session.id}/restore`,
      "POST",
    );
    await request(`/sessions/${sent.session.id}`, "DELETE");
    const sessionHard = await request(
      `/sessions/${sent.session.id}?permanent=true`,
      "DELETE",
    );
    const docId = sent.messages[1].sources[0];
    const docSoft = await request(`/documents/${docId}`, "DELETE");
    const docRestore = await request(`/documents/${docId}/restore`, "POST");
    await request(`/documents/${docId}`, "DELETE");
    const docHard = await request(
      `/documents/${docId}?permanent=true`,
      "DELETE",
    );
    const missing = await request(`/documents/${docId}/restore`, "POST");
    const errorForm = new FormData();
    errorForm.append("message", "/error");
    const error = await fetch("/api/chats", {
      method: "POST",
      body: errorForm,
    });
    return {
      active: active.data.length,
      docs: docs.data.length,
      deleted: deleted.data.length,
      deletedDocs: deletedDocs.data.length,
      related: related.data.length,
      chats: chats.data.length,
      renamed: renamed.data.title,
      send: sendResponse.status,
      sourceCount: sent.messages[1].sources.length,
      edited: edited.data.content,
      feedback: feedback.status,
      sessionSoft: sessionSoft.status,
      foundDeleted: afterSoft.data.some(
        (s: { id: string }) => s.id === sent.session.id,
      ),
      sessionRestore: sessionRestore.status,
      sessionHard: sessionHard.status,
      docSoft: docSoft.status,
      docRestore: docRestore.status,
      docHard: docHard.status,
      missing: missing.status,
      error: error.status,
    };
  });
  expect(result).toEqual({
    active: 4,
    docs: 6,
    deleted: 1,
    deletedDocs: 1,
    related: 3,
    chats: 2,
    renamed: "Renamed review",
    send: 201,
    sourceCount: 1,
    edited: "Updated upload question",
    feedback: 201,
    sessionSoft: 204,
    foundDeleted: true,
    sessionRestore: 200,
    sessionHard: 204,
    docSoft: 204,
    docRestore: 200,
    docHard: 204,
    missing: 404,
    error: 500,
  });
});

test("uploaded filename mapping renders a real PDF and supports zoom", async ({
  page,
}) => {
  const { writeFile, unlink } = await import("node:fs/promises");
  const content = "BT /F1 20 Tf 40 150 Td (PDF preview integration test) Tj ET";
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 300 200] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
  ];
  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((object, i) => {
    offsets.push(pdf.length);
    pdf += `${i + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xref = pdf.length;
  pdf += `xref\n0 6\n0000000000 65535 f \n${offsets
    .slice(1)
    .map((offset) => String(offset).padStart(10, "0") + " 00000 n \n")
    .join("")}trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  const path = "public/pdfs/e2e-preview-test.pdf";
  await writeFile(path, pdf, { flag: "wx" });
  try {
    await page.goto("/");
    await page.getByRole("button", { name: "New Chat", exact: true }).click();
    await page.locator("input[type=file]").setInputFiles({
      name: "e2e-preview-test.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.from(pdf),
    });
    await page
      .getByRole("textbox", { name: "Message", exact: true })
      .fill("Read my PDF");
    await page.getByRole("button", { name: "Send message" }).click();
    await page.locator(".source").click();
    await expect(page.locator(".react-pdf__Page__canvas")).toBeVisible();
    await expect(page.locator(".react-pdf__Page__textContent")).toContainText(
      "PDF preview integration test",
    );
    await expect(page.getByRole("button", { name: "Print PDF" })).toBeEnabled();
    await page.getByRole("button", { name: "Zoom in" }).click();
    await expect(page.locator(".pdf-toolbar")).toContainText("125%");
    await expect
      .poll(async () =>
        page.locator(".react-pdf__Page__canvas").evaluate((element) => {
          const canvas = element as HTMLCanvasElement;
          const pixels = canvas
            .getContext("2d")
            ?.getImageData(0, 0, canvas.width, canvas.height).data;
          return pixels
            ? pixels.some(
                (value, index) =>
                  index % 4 === 0 && value < 150 && pixels[index + 3] > 0,
              )
            : false;
        }),
      )
      .toBe(true);
    await page.screenshot({ path: "/tmp/pdf-preview-desktop.png" });
  } finally {
    await unlink(path);
  }
});

test("tablet library selection, answer mode, and permanent delete confirmation", async ({
  page,
}) => {
  await page.setViewportSize({ width: 820, height: 1180 });
  await page.goto("/");
  await page.getByRole("button", { name: "New Chat", exact: true }).click();
  await page
    .getByRole("button", { name: "Choose a document", exact: true })
    .click();
  await page
    .getByRole("textbox", { name: "Search library" })
    .fill("Financial Analysis");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Use 1 selected document" }).click();
  await expect(page.locator(".attachments")).toContainText(
    "Financial Analysis.pdf",
  );
  await page
    .locator(".composer-actions")
    .getByRole("button", { name: "Document Only", exact: true })
    .click();
  await page.getByRole("menuitem", { name: /General Knowledge/ }).click();
  await page
    .getByRole("textbox", { name: "Message", exact: true })
    .fill("Explain revenue growth");
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(page.locator(".assistant")).toContainText(
    "mock general knowledge",
  );
  await expect(page.locator(".source")).toHaveCount(0);
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(820);
  await page
    .getByRole("navigation")
    .getByRole("button", { name: "Trash", exact: true })
    .click();
  const row = page.locator(".trash-row").filter({
    has: page.getByRole("heading", {
      name: "Archived Research.pdf",
      exact: true,
    }),
  });
  await row.getByRole("button", { name: "Delete", exact: true }).click();
  await expect(page.getByRole("dialog")).toContainText("cannot be undone");
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(row).toBeVisible();
  await row.getByRole("button", { name: "Delete", exact: true }).click();
  await page
    .getByRole("button", { name: "Delete permanently", exact: true })
    .click();
  await expect(row).toHaveCount(0);
});

test("revision routes, initial mocked query, dropdown toggle and recent search", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator(".user .message-bubble")).toBeVisible();
  const trigger = page
    .locator(".page-header")
    .getByRole("button", { name: "Documents", exact: true });
  await trigger.click();
  await expect(page.getByRole("menu")).toBeVisible();
  await trigger.click();
  await expect(page.getByRole("menu")).toHaveCount(0);
  await page
    .getByRole("textbox", { name: "Search recent chats" })
    .fill("Marketing");
  await expect(page.locator(".recent-chat")).toHaveCount(1);
  await page.getByRole("button", { name: "See All", exact: true }).click();
  await expect(page.locator(".recent-chats")).toHaveClass(/expanded/);
  await page.getByRole("button", { name: "See Less", exact: true }).click();
  await expect(page.locator(".recent-chats")).not.toHaveClass(/expanded/);
  await page.goto("/documents");
  await expect(page.locator(".document-card")).toHaveCount(3);
  const pagination = page.getByRole("navigation", {
    name: "Documents pagination",
  });
  await pagination.getByRole("button", { name: "Next" }).click();
  await expect(pagination).toContainText("Page 2 of 2");
  await page.getByRole("button", { name: "Grid View" }).click();
  await expect(pagination).toContainText("Page 2 of 2");
  await page.getByRole("textbox", { name: "Search documents" }).fill("Annual");
  await expect(pagination).toContainText("Page 1 of 1");
  await page.goto("/trash");
  await expect(
    page.getByRole("navigation", { name: "sessions history pagination" }),
  ).toContainText("Page 1");
  await expect(
    page.getByRole("navigation", { name: "documents history pagination" }),
  ).toContainText("Page 1");
});

test("desktop side panel resize clamps to 20–40 percent in both modes", async ({
  page,
}) => {
  await page.goto("/");
  await page.locator(".source").first().click();
  const group = page.locator(".preview-group");
  const handle = page.getByRole("separator");
  await expect(handle).toBeVisible();
  for (const expanded of [false, true]) {
    if (expanded)
      await page.getByRole("button", { name: "Expand preview" }).click();
    for (const offset of [-1000, 1000]) {
      const box = await handle.boundingBox();
      if (!box) throw new Error("Missing resize handle");
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down();
      await page.mouse.move(box.x + offset, box.y + 20);
      await page.mouse.up();
      const side = page.locator(
        expanded ? ".primary-screen" : ".preview-panel",
      );
      const fraction =
        (await side.boundingBox())!.width / (await group.boundingBox())!.width;
      expect(fraction).toBeGreaterThanOrEqual(0.19);
      expect(fraction).toBeLessThanOrEqual(0.41);
    }
  }
});

test("history pages change independently after soft deletes", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator(".user .message-bubble")).toBeVisible();
  await page.evaluate(async () => {
    for (const domain of ["sessions", "documents"]) {
      for (let i = 1; i <= 4; i++)
        await fetch(
          `/api/${domain}/${domain === "sessions" ? "session" : "doc"}-${i}`,
          { method: "DELETE" },
        );
    }
  });
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("button", { name: "Trash", exact: true })
    .click();
  const chats = page.getByRole("navigation", {
    name: "sessions history pagination",
  });
  const docs = page.getByRole("navigation", {
    name: "documents history pagination",
  });
  await expect(chats).toContainText("Page 1 of 2");
  await expect(docs).toContainText("Page 1 of 2");
  await chats.getByRole("button", { name: "Next" }).click();
  await expect(chats).toContainText("Page 2 of 2");
  await expect(docs).toContainText("Page 1 of 2");
  await docs.getByRole("button", { name: "Next" }).click();
  await expect(docs).toContainText("Page 2 of 2");
  await expect(chats).toContainText("Page 2 of 2");
});

test("pagination page size and sidebar placement follow the revised design", async ({page}) => {
 await page.goto("/documents");
 await expect(page.locator(".document-card")).toHaveCount(3);
 const footer = page.getByRole("navigation", {name: "Documents pagination"});
 await footer.getByLabel("Documents pagination rows per page").selectOption("10");
 await expect(page.locator(".document-card")).toHaveCount(6);
 await expect(footer.getByRole("button", {name: "Last page"})).toBeDisabled();
 const section = page.locator(".sidebar .recent-section");
 const list = await section.locator(".recent-chats").boundingBox();
 const more = await section.getByRole("button", {name: "See All", exact: true}).boundingBox();
 expect(more!.y - (list!.y + list!.height)).toBeLessThan(20);
 expect(more!.x).toBeGreaterThan(list!.x + list!.width / 2);
 await footer.scrollIntoViewIfNeeded();
 await page.screenshot({path: "/tmp/revision-documents-desktop.png", fullPage: true});
 await page.setViewportSize({width: 390, height: 844});
 expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
 await footer.scrollIntoViewIfNeeded();
 await page.screenshot({path: "/tmp/revision-documents-mobile.png", fullPage: true});
});
