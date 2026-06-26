import { sendExecRequest } from "@/utils/api"
import { NextResponse } from "next/server"
export async function GET() {
  return Response.json({
    projectName: 'Next.js',
  })
}

export async function POST(req: Request) {
  const { code, postprocessing } = await req.json()
  if (postprocessing) {
    let zipFileData = await fetch(process.env.BACKEND_DOMAIN + "/exec", {
      method: "POST",
      body: JSON.stringify({ code, postprocessing }),
      headers: {
        "Content-Type": "application/json",
      }
    })
    let blob = await zipFileData.blob()
    const downloadURL = URL.createObjectURL(blob)
    console.log("Download URL: ", downloadURL)
    // return Response.json({
    //   "success": true,
    //   "output": downloadURL
    // })
    console.log("ZipFile Data: ", zipFileData)
    console.log("Serving zip file...")
    return new Response(blob, { headers: { "Content-Type": "application/zip", "Content-Disposition": `attachment; filename = exports.zip`} })
  } else {
    const data = await sendExecRequest(code, postprocessing)
    console.log("Data from /api/exec:", data)
    return Response.json(data)
  }
}