// netlify/functions/get-properties.js
// هذه الدالة تجلب تلقائياً كل العقارات من مجلد properties في GitHub

exports.handler = async function(event, context) {
const REPO = “robotsuperx-create/faisal-realestate”;
const BRANCH = “main”;
const FOLDER = “properties”;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN; // اختياري لرفع حد الطلبات

const headers = {
“Accept”: “application/vnd.github.v3+json”,
“User-Agent”: “faisal-realestate-site”
};
if (GITHUB_TOKEN) headers[“Authorization”] = `Bearer ${GITHUB_TOKEN}`;

try {
// 1. جلب قائمة الملفات من مجلد properties
const listUrl = `https://api.github.com/repos/${REPO}/contents/${FOLDER}?ref=${BRANCH}`;
const listRes = await fetch(listUrl, { headers });

```
if (!listRes.ok) {
  throw new Error(`GitHub API error: ${listRes.status}`);
}

const files = await listRes.json();

// 2. فلترة ملفات JSON فقط (تجاهل list.json وأي ملف آخر)
const propertyFiles = files.filter(f =>
  f.name.endsWith(".json") && f.name !== "list.json"
);

// 3. جلب محتوى كل عقار بالتوازي
const propertyPromises = propertyFiles.map(async (file) => {
  try {
    const res = await fetch(file.download_url);
    if (res.ok) {
      const data = await res.json();
      // إضافة slug تلقائياً من اسم الملف
      data._slug = file.name.replace(".json", "");
      return data;
    }
    return null;
  } catch (err) {
    console.warn("فشل تحميل:", file.name, err);
    return null;
  }
});

const properties = (await Promise.all(propertyPromises)).filter(Boolean);

return {
  statusCode: 200,
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Cache-Control": "public, max-age=60" // cache دقيقة واحدة
  },
  body: JSON.stringify(properties)
};
```

} catch (error) {
console.error(“خطأ في get-properties:”, error);
return {
statusCode: 500,
headers: { “Content-Type”: “application/json” },
body: JSON.stringify({ error: error.message })
};
}
};
