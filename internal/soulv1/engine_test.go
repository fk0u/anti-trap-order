package soulv1_test

import (
	"testing"

	"prototype-ato/internal/data"
	"prototype-ato/internal/soulv1"
)

func engine(t *testing.T) (*soulv1.Engine, *data.SoulV1Content) {
	t.Helper()
	repo, err := data.Load()
	if err != nil {
		t.Fatal(err)
	}
	c, err := data.LoadSoulV1(repo.V1().Characters)
	if err != nil {
		t.Fatal(err)
	}
	return soulv1.New(c), c
}

func in(m soulv1.Meters) *soulv1.MetersIn {
	return &soulv1.MetersIn{Kepercayaan: &m.Kepercayaan, Kewaspadaan: &m.Kewaspadaan, Keamanan: &m.Keamanan}
}

func sp(s string) *string { return &s }

// play menjalankan satu jalur pilihan (mis. "BCA") dan mengembalikan ringkasan akhir.
func play(t *testing.T, e *soulv1.Engine, arc, path string) *soulv1.Summary {
	t.Helper()
	st, err := e.Start(soulv1.StartRequest{ArcID: sp(arc)})
	if err != nil {
		t.Fatal(err)
	}
	m, mission := st.Meters, st.Mission
	for i, ch := range path {
		r, err := e.Step(soulv1.StepRequest{ArcID: sp(arc), MissionID: sp(mission.ID), ChoiceID: sp(string(ch)), Meters: in(m)})
		if err != nil {
			t.Fatalf("%s %s: %v", arc, path, err)
		}
		m = r.Meters
		if r.MissionIndex != i+1 || (r.Summary == nil) != (i < 2) || (r.NextMission == nil) != (i == 2) {
			t.Fatalf("%s %s langkah %d: next/summary salah", arc, path, i+1)
		}
		if i < 2 {
			mission = *r.NextMission
		} else if r.Summary.FinalMeters != m {
			t.Fatal("final_meters tidak sama dengan meters")
		}
		if m.Kepercayaan < 0 || m.Kepercayaan > 100 || m.Kewaspadaan < 0 || m.Kewaspadaan > 100 || m.Keamanan < 0 || m.Keamanan > 100 {
			t.Fatalf("meter di luar rentang: %+v", m)
		}
		if i == 2 {
			return r.Summary
		}
	}
	return nil
}

func TestAllPathsReachRank(t *testing.T) {
	e, c := engine(t)
	ids := map[string]bool{"pemula_waspada": true, "penjaga_siaga": true, "penjaga_teguh": true}
	for _, a := range c.Arcs {
		count := map[string]int{}
		best, worst := "", ""
		bt, wt := -1, 1000
		for _, x := range "ABC" {
			for _, y := range "ABC" {
				for _, z := range "ABC" {
					p := string([]rune{x, y, z})
					s := play(t, e, a.ID, p)
					if !ids[s.RankID] || s.RankLabel == "" || len(s.Insights) == 0 || s.Description == "" {
						t.Fatalf("%s %s: ringkasan tidak valid %+v", a.ID, p, s)
					}
					count[s.RankID]++
					if tot := s.FinalMeters.Total(); tot > bt {
						bt, best = tot, s.RankID
					}
					if tot := s.FinalMeters.Total(); tot < wt {
						wt, worst = tot, s.RankID
					}
				}
			}
		}
		t.Logf("%s: %v", a.ID, count)
		if best != "penjaga_teguh" || worst != "pemula_waspada" {
			t.Errorf("%s: jalur terbaik %s, terburuk %s", a.ID, best, worst)
		}
		for id := range ids {
			if count[id] == 0 {
				t.Errorf("%s: peringkat %s tidak terjangkau", a.ID, id)
			}
		}
	}
}

func TestStartAndDeterminism(t *testing.T) {
	e, _ := engine(t)
	r, err := e.Start(soulv1.StartRequest{ArcID: sp("arc_investasi")})
	if err != nil || r.TotalMissions != 3 || r.Mission.Index != 1 || r.Mission.ID != "m1" || len(r.Mission.Choices) != 3 || r.Meters != (soulv1.Meters{Kepercayaan: 60, Kewaspadaan: 40, Keamanan: 60}) {
		t.Fatalf("start salah: %+v %v", r, err)
	}
	if a, b := play(t, e, "arc_investasi", "BBB"), play(t, e, "arc_investasi", "BBB"); a.RankID != b.RankID {
		t.Error("tidak deterministik")
	}
}

func TestStepValidation(t *testing.T) {
	e, _ := engine(t)
	ok := soulv1.Meters{Kepercayaan: 60, Kewaspadaan: 40, Keamanan: 60}
	neg, big := -1, 101
	cases := []struct {
		name   string
		req    soulv1.StepRequest
		status int
		field  string
	}{
		{"arc nil", soulv1.StepRequest{MissionID: sp("m1"), ChoiceID: sp("A"), Meters: in(ok)}, 400, "arc_id"},
		{"arc tak dikenal", soulv1.StepRequest{ArcID: sp("x"), MissionID: sp("m1"), ChoiceID: sp("A"), Meters: in(ok)}, 404, ""},
		{"mission nil", soulv1.StepRequest{ArcID: sp("arc_investasi"), ChoiceID: sp("A"), Meters: in(ok)}, 400, "mission_id"},
		{"mission m0", soulv1.StepRequest{ArcID: sp("arc_investasi"), MissionID: sp("m0"), ChoiceID: sp("A"), Meters: in(ok)}, 400, "mission_id"},
		{"choice nil", soulv1.StepRequest{ArcID: sp("arc_investasi"), MissionID: sp("m1"), Meters: in(ok)}, 400, "choice_id"},
		{"choice a kecil", soulv1.StepRequest{ArcID: sp("arc_investasi"), MissionID: sp("m1"), ChoiceID: sp("a"), Meters: in(ok)}, 400, "choice_id"},
		{"meters nil", soulv1.StepRequest{ArcID: sp("arc_investasi"), MissionID: sp("m1"), ChoiceID: sp("A")}, 400, "meters"},
		{"meter hilang", soulv1.StepRequest{ArcID: sp("arc_investasi"), MissionID: sp("m1"), ChoiceID: sp("A"), Meters: &soulv1.MetersIn{Kepercayaan: &big}}, 400, "meters.kepercayaan"},
		{"keamanan negatif", soulv1.StepRequest{ArcID: sp("arc_investasi"), MissionID: sp("m1"), ChoiceID: sp("A"), Meters: &soulv1.MetersIn{Kepercayaan: new(int), Kewaspadaan: new(int), Keamanan: &neg}}, 400, "meters.keamanan"},
	}
	for _, c := range cases {
		_, err := e.Step(c.req)
		if err == nil || err.Status != c.status || err.Field != c.field {
			t.Errorf("%s: dapat %+v", c.name, err)
		}
	}
}

func TestClamp(t *testing.T) {
	e, _ := engine(t)
	top := soulv1.Meters{Kepercayaan: 100, Kewaspadaan: 100, Keamanan: 100}
	r, err := e.Step(soulv1.StepRequest{ArcID: sp("arc_investasi"), MissionID: sp("m1"), ChoiceID: sp("B"), Meters: in(top)})
	if err != nil || r.Meters != top {
		t.Errorf("dijepit 100: %+v %v", r.Meters, err)
	}
	r, err = e.Step(soulv1.StepRequest{ArcID: sp("arc_investasi"), MissionID: sp("m1"), ChoiceID: sp("A"), Meters: in(soulv1.Meters{})})
	if err != nil || r.Meters.Kewaspadaan != 0 || r.Meters.Keamanan != 0 {
		t.Errorf("dijepit 0: %+v %v", r.Meters, err)
	}
}
