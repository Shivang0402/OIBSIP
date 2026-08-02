const INK = "#1c1917";
const ORANGE = "#f97316";
const BODY = "#44403c";
const MUTED = "#a8a29e";
const DIVIDER = "#f0e9e2";

const renderEmail = ({ title, greeting, bodyHtml, ctaText, ctaHref }) => {
  const cta = ctaText && ctaHref
    ? `
      <div style="margin:28px 0 8px;">
        <a
          href="${ctaHref}"
          style="
            display:inline-block;
            background:${ORANGE};
            color:#ffffff;
            text-decoration:none;
            font-size:14px;
            font-weight:700;
            font-family:Arial, Helvetica, sans-serif;
            padding:13px 28px;
            border-radius:8px;
          "
        >${ctaText}</a>
      </div>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title} — PizzaNova</title>
</head>
<body style="margin:0;padding:0;background:#ffffff;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:36px 20px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;">
          <tr>
            <td style="padding-bottom:18px;">
              <span style="font-family:Arial, Helvetica, sans-serif;font-size:20px;font-weight:800;letter-spacing:-0.02em;color:${INK};">Pizza</span><span style="font-family:Arial, Helvetica, sans-serif;font-size:20px;font-weight:800;letter-spacing:-0.02em;color:${ORANGE};">Nova</span>
            </td>
          </tr>
          <tr>
            <td style="border-top:1px solid ${DIVIDER};"></td>
          </tr>
          <tr>
            <td style="padding:26px 0 0;">
              <h1 style="margin:0 0 12px;font-family:Arial, Helvetica, sans-serif;font-size:22px;font-weight:800;letter-spacing:-0.02em;color:${INK};">
                ${title}
              </h1>
              ${greeting ? `<p style="margin:0 0 14px;font-family:Arial, Helvetica, sans-serif;font-size:14px;line-height:1.6;color:${BODY};">${greeting}</p>` : ""}
              ${bodyHtml}
              ${cta}
            </td>
          </tr>
          <tr>
            <td style="border-top:1px solid ${DIVIDER};"></td>
          </tr>
          <tr>
            <td style="padding-top:16px;text-align:left;">
              <p style="margin:0 0 4px;font-family:Arial, Helvetica, sans-serif;font-size:12px;color:${MUTED};">© 2026 PizzaNova. All rights reserved.</p>
              <p style="margin:0;font-family:Arial, Helvetica, sans-serif;font-size:12px;color:${MUTED};">Crafted With Every Slice.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};

module.exports = { renderEmail };
