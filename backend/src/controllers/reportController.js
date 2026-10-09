import mongoose from "mongoose";
import Report from "../models/Report.js";

function getUserId(req) {
  return req.user?._id || req.user?.id;
}

function ownership(req) {
  return { createdBy: getUserId(req) };
}

export async function downloadReport(req, res, next) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ success: false, message: "Invalid report ID" });

    const report = await Report.findOne({ _id: id, ...ownership(req) }).populate("project", "name").lean();
    if (!report) return res.status(404).json({ success: false, message: "Report not found" });

    const format = String(req.query.format || report.format || "JSON").toUpperCase();
    const safeTitle = String(report.title || "report").replace(/[^a-z0-9-_]+/gi, "-").replace(/^-+|-+$/g, "").toLowerCase() || "report";

    if (format === "HTML") {
      const html = `<!doctype html><html><head><meta charset="utf-8"><title>${report.title}</title><style>body{font-family:Inter,Arial,sans-serif;max-width:900px;margin:40px auto;padding:0 24px;color:#172033}h1{color:#4338ca}pre{white-space:pre-wrap;background:#f5f7fb;padding:20px;border-radius:14px}</style></head><body><h1>${report.title}</h1><p>Project: ${report.project?.name || "Unassigned"}</p><pre>${escapeHtml(JSON.stringify(report.content || {}, null, 2))}</pre></body></html>`;
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.setHeader("Content-Disposition", `attachment; filename="${safeTitle}.html"`);
      return res.send(html);
    }

    if (format === "CSV") {
      const rows = flattenObject(report.content || {});
      const csv = ["Field,Value", ...rows.map(([key, value]) => `"${escapeCsv(key)}","${escapeCsv(value)}"`)].join("\n");
      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader("Content-Disposition", `attachment; filename="${safeTitle}.csv"`);
      return res.send(csv);
    }

    const json = JSON.stringify(report, null, 2);
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${safeTitle}.json"`);
    return res.send(json);
  } catch (error) {
    next(error);
  }
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char]));
}

function escapeCsv(value) {
  return String(value).replace(/"/g, '""');
}

function flattenObject(value, prefix = "", output = []) {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    Object.entries(value).forEach(([key, child]) => flattenObject(child, prefix ? `${prefix}.${key}` : key, output));
  } else {
    output.push([prefix, Array.isArray(value) ? value.join("; ") : value ?? ""]);
  }
  return output;
}
