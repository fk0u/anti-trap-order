package data

import (
	"os"
	"strings"
	"testing"
)

func TestLoadSoulV1(t *testing.T) {
	repo, err := Load()
	if err != nil {
		t.Fatal(err)
	}
	c, err := LoadSoulV1(repo.V1().Characters)
	if err != nil || len(c.Arcs) != 3 {
		t.Fatalf("%v %+v", err, c)
	}
}

func TestParseSoulV1Invalid(t *testing.T) {
	repo, _ := Load()
	raw, err := os.ReadFile("v1/soul-arcs.json")
	if err != nil {
		t.Fatal(err)
	}
	src := string(raw)
	cases := []struct{ name, old, new, want string }{
		{"kind salah", `"kind": "campuran"`, `"kind": "netral"`, "kind"},
		{"choice id", `"id": "C", "label": "\"Jangan! Blokir`, `"id": "D", "label": "\"Jangan! Blokir`, "pilihan ke-3"},
		{"arc tak dirujuk", `"id": "arc_investasi"`, `"id": "arc_lain"`, "arc"},
		{"min_total tidak menaik", `"min_total": 220`, `"min_total": 100`, "menaik"},
		{"meter awal", `"kepercayaan": 60, "kewaspadaan": 40`, `"kepercayaan": 160, "kewaspadaan": 40`, "initial_meters"},
		{"delta liar", `"keamanan": -30`, `"keamanan": -300`, "delta"},
		{"field tak dikenal", `"notes":`, `"nama": "x", "notes":`, "unknown field"},
		{"misi id", `"id": "m3"`, `"id": "m9"`, "misi ke-3"},
	}
	for _, c := range cases {
		if !strings.Contains(src, c.old) {
			t.Fatalf("%s: pola tidak ada", c.name)
		}
		_, err := ParseSoulV1([]byte(strings.Replace(src, c.old, c.new, 1)), repo.V1().Characters)
		if err == nil || !strings.Contains(err.Error(), c.want) {
			t.Errorf("%s: dapat %v", c.name, err)
		}
	}
}
