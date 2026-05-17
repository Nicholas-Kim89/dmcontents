import json
from pathlib import Path
from main import load_db

if __name__ == "__main__":
    db = load_db()
    print("Migration completed.")
    print(f"Teams: {len(db.get('teams', []))}")
    print(f"Projects migrated: {len([p for p in db.get('projects', []) if p.get('team_id') == 'team-default'])}")
