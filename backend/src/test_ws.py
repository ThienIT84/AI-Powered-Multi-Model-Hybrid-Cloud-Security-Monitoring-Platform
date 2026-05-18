import asyncio
import json
import websockets

async def run():
    uri = "ws://localhost:8000/ws"
    try:
        async with websockets.connect(uri) as ws:
            print(f"Connected to {uri}")
            # receive up to 10 messages then exit
            for i in range(10):
                msg = await ws.recv()
                try:
                    parsed = json.loads(msg)
                    pretty = json.dumps(parsed, indent=2, ensure_ascii=False)
                    print(f"\n--- message #{i+1} ---\n{pretty}\n")
                except Exception:
                    print(f"raw: {msg}")
    except Exception as e:
        print(f"Connection error: {e}")

if __name__ == '__main__':
    asyncio.run(run())
