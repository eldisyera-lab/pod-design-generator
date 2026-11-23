"""Launcher robusto para PrintStudio: evita reutilizar un servidor antiguo en el puerto fijo."""
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
import socket
import threading
import webbrowser

BASE_DIR = Path(__file__).resolve().parent
HOST = "127.0.0.1"
PORT_START = 8765
PORT_END = 8795

class PrintStudioServer(ThreadingHTTPServer):
    allow_reuse_address = True
    daemon_threads = True

def choose_port():
    for port in range(PORT_START, PORT_END + 1):
        probe = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        try:
            probe.bind((HOST, port))
            return port
        except OSError:
            pass
        finally:
            probe.close()
    raise RuntimeError(
        f"No hay puertos libres entre {PORT_START} y {PORT_END}. "
        "Cierra ventanas antiguas de PrintStudio y vuelve a intentarlo."
    )

def main():
    import os
    os.chdir(BASE_DIR)
    port = choose_port()
    server = PrintStudioServer((HOST, port), SimpleHTTPRequestHandler)
    url = f"http://{HOST}:{port}/"
    print("=" * 58)
    print(" PRINTSTUDIO — servidor local")
    print(f" Carpeta activa: {BASE_DIR}")
    print(f" Dirección:     {url}")
    if port != PORT_START:
        print(f" AVISO: el puerto {PORT_START} estaba ocupado.")
        print(" Se ha elegido otro puerto para no abrir una versión antigua.")
    print(" Mantén esta ventana abierta mientras uses PrintStudio.")
    print(" Para cerrar el servidor, pulsa Ctrl+C.")
    print("=" * 58, flush=True)
    threading.Timer(1.0, lambda: webbrowser.open(url)).start()
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\\nCerrando PrintStudio…")
    finally:
        server.server_close()

if __name__ == "__main__":
    main()
