"""
Custom runserver command that forces ASGI mode for WebSocket support.
"""
import os
import sys
from django.core.management.commands.runserver import Command as BaseRunserverCommand
from django.core.management.base import CommandError


class Command(BaseRunserverCommand):
    help = "Start development server with ASGI WebSocket support"

    def handle(self, *args, **options):
        """Override to use daphne instead of Django's built-in server"""
        
        # Get the address and port
        addrport = options['addrport']
        if not addrport:
            addr = '127.0.0.1'
            port = '8000'
        else:
            if ':' in addrport:
                addr, port = addrport.rsplit(':', 1)
            else:
                addr = '127.0.0.1'
                port = addrport

        # Import and run daphne
        try:
            from daphne.cli import CommandLineInterface
            from daphne.endpoints import build_endpoint_description_strings
            import logging
            
            # Set up basic logging
            logging.basicConfig(level=logging.INFO)
            
            # Build daphne command line arguments
            daphne_args = [
                '-b', addr,
                '-p', port,
                'agi.asgi:application'
            ]
            
            print(f"Starting ASGI server with WebSocket support at http://{addr}:{port}/")
            print("Quit the server with CTRL-BREAK.")
            
            # Run daphne
            cli = CommandLineInterface()
            cli.run(daphne_args)
            
        except ImportError:
            raise CommandError(
                "daphne is required for WebSocket support. "
                "Install it with: pip install daphne"
            )
        except KeyboardInterrupt:
            print("\nServer stopped.")
