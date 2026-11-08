package lite_test

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"reflect"
	"strings"
	"testing"

	"prototype-ato/internal/data"
	"prototype-ato/internal/lite"
)

func content(t *testing.T) *data.V1Content {
	t.Helper()
	c, err := data.LoadV1()
	if err != nil {
		t.Fatal(err)
	}
	return c
}

func ans(q string, opts ...string) lite.Answer { return lite.Answer{QuestionID: q, OptionIDs: opts} }

func wfh(a1, a2, a3 lite.Answer) lite.Request {
	return lite.Request{ScenarioID: "wfh_admin_fee", Answers: []lite.Answer{a1, a2, a3}}
}

func ids(cs []lite.GapCard) string {
	var s []string
	for _, c := range cs {
		s = append(s, c.FlawID)
	}
	return strings.Join(s, ",")
}

func TestReflectFoundMissed(t *testing.T) {
	c := content(t)
	cases := []struct {
		name         string
		req          lite.Request
		found, missd string
	}{
		{"nol found", wfh(ans("q1", "q1_b"), ans("q2", "q2_d"), ans("q3", "q3_c")), "", "flaw_upfront_fee,flaw_too_good,flaw_urgency,flaw_impersonation"},
		{"satu found", wfh(ans("q1", "q1_a"), ans("q2", "q2_d"), ans("q3", "q3_c")), "flaw_too_good", "flaw_upfront_fee,flaw_urgency,flaw_impersonation"},
		{"banyak found urut severity", wfh(ans("q1", "q1_a"), ans("q2", "q2_a", "q2_b"), ans("q3", "q3_e")), "flaw_upfront_fee,flaw_too_good,flaw_urgency", "flaw_impersonation"},
		{"hanya other", wfh(lite.Answer{QuestionID: "q1", OptionIDs: []string{}, OtherFilled: true}, ans("q2", "q2_d"), ans("q3", "q3_c")), "", "flaw_upfront_fee,flaw_too_good,flaw_urgency,flaw_impersonation"},
		{"semua found -> kandidat katalog", wfh(ans("q1", "q1_a", "q1_c"), ans("q2", "q2_a"), ans("q3", "q3_e")), "flaw_upfront_fee,flaw_too_good,flaw_urgency,flaw_impersonation", "tactic_credential_request"},
	}
	for _, tc := range cases {
		r, err := lite.Reflect(c, tc.req)
		if err != nil {
			t.Fatalf("%s: %v", tc.name, err)
		}
		if ids(r.Found) != tc.found || ids(r.MissedCandidates) != tc.missd || r.FoundCount != len(r.Found) || len(r.MissedCandidates) < 1 {
			t.Errorf("%s: found=%s missed=%s", tc.name, ids(r.Found), ids(r.MissedCandidates))
		}
		for _, g := range r.Found {
			if g.UserQuote == nil || g.Kind != "found" {
				t.Errorf("%s: found tanpa user_quote", tc.name)
			}
		}
		for _, g := range r.MissedCandidates {
			if g.UserQuote != nil || g.Kind != "missed" {
				t.Errorf("%s: missed salah", tc.name)
			}
		}
	}
	r, _ := lite.Reflect(c, cases[1].req)
	if *r.Found[0].UserQuote != "Dia butuh uang cepat" || r.Found[0].Tactic.Label == "" || r.Disclaimer != lite.Disclaimer || r.Category.ID != "tawaran_kerja" {
		t.Errorf("isi found/kategori salah: %+v", r.Found[0])
	}
}

func TestReflectAlwaysAtLeastOneMissed(t *testing.T) {
	c := content(t)
	for _, sc := range c.Scenarios {
		req := lite.Request{ScenarioID: sc.ID}
		for _, q := range sc.Questions {
			req.Answers = append(req.Answers, ans(q.ID, q.Options[0].ID, q.Options[1].ID))
		}
		r, err := lite.Reflect(c, req)
		if err != nil || len(r.MissedCandidates) < 1 {
			t.Errorf("%s: %v %d", sc.ID, err, len(r.MissedCandidates))
		}
	}
}

func TestReflectValidation(t *testing.T) {
	c := content(t)
	ok := wfh(ans("q1", "q1_a"), ans("q2", "q2_a"), ans("q3", "q3_a"))
	mut := func(f func(r *lite.Request)) lite.Request {
		r := ok
		r.Answers = append([]lite.Answer(nil), ok.Answers...)
		f(&r)
		return r
	}
	cases := []struct {
		name   string
		req    lite.Request
		status int
		field  string
	}{
		{"skenario kosong", mut(func(r *lite.Request) { r.ScenarioID = "" }), 400, "scenario_id"},
		{"skenario tak ada", mut(func(r *lite.Request) { r.ScenarioID = "nope" }), 404, ""},
		{"jawaban 2", mut(func(r *lite.Request) { r.Answers = r.Answers[:2] }), 400, "answers"},
		{"pertanyaan asing", mut(func(r *lite.Request) { r.Answers[1].QuestionID = "q9" }), 400, "answers[1].question_id"},
		{"pertanyaan ganda", mut(func(r *lite.Request) { r.Answers[2] = ans("q1", "q1_a") }), 400, "answers[2].question_id"},
		{"opsi null", mut(func(r *lite.Request) { r.Answers[0].OptionIDs = nil }), 400, "answers[0].option_ids"},
		{"opsi kosong tanpa other", mut(func(r *lite.Request) { r.Answers[1].OptionIDs = []string{} }), 400, "answers[1].option_ids"},
		{"opsi 3", mut(func(r *lite.Request) { r.Answers[1] = ans("q2", "q2_a", "q2_b", "q2_c") }), 400, "answers[1].option_ids"},
		{"opsi ganda", mut(func(r *lite.Request) { r.Answers[1] = ans("q2", "q2_a", "q2_a") }), 400, "answers[1].option_ids[1]"},
		{"opsi milik pertanyaan lain", mut(func(r *lite.Request) { r.Answers[2] = ans("q3", "q1_a") }), 400, "answers[2].option_ids[0]"},
	}
	for _, tc := range cases {
		_, err := lite.Reflect(c, tc.req)
		if err == nil || err.Status != tc.status || err.Field != tc.field || err.Message == "" {
			t.Errorf("%s: %+v", tc.name, err)
		}
	}
}

func TestHandleStrictDecode(t *testing.T) {
	c := content(t)
	good := `{"scenario_id":"wfh_admin_fee","answers":[{"question_id":"q1","option_ids":["q1_a"]},{"question_id":"q2","option_ids":["q2_a"]},{"question_id":"q3","option_ids":["q3_a"]}]}`
	for name, body := range map[string]string{
		"field asing":            strings.Replace(good, `"answers"`, `"x":1,"answers"`, 1),
		"field asing di jawaban": strings.Replace(good, `"option_ids":["q1_a"]`, `"option_ids":["q1_a"],"text":"rahasia"`, 1),
		"data sisa":              good + `{}`,
		"bukan json":             `rahasia`,
		"kosong":                 ``,
	} {
		st, out := lite.Handle(c, []byte(body))
		b, _ := json.Marshal(out)
		if st != http.StatusBadRequest || strings.Contains(string(b), "rahasia") {
			t.Errorf("%s: %d %s", name, st, b)
		}
	}
	if st, _ := lite.Handle(c, []byte(good)); st != 200 {
		t.Errorf("good: %d", st)
	}
}

type fixture struct {
	Name     string          `json:"name"`
	Request  json.RawMessage `json:"request"`
	Status   int             `json:"status"`
	Response json.RawMessage `json:"response"`
}

func q(sc string, a ...string) string {
	return fmt.Sprintf(`{"scenario_id":%q,"answers":[%s]}`, sc, strings.Join(a, ","))
}

func a(qid string, opts string, other bool) string {
	return fmt.Sprintf(`{"question_id":%q,"option_ids":[%s],"other_filled":%v}`, qid, opts, other)
}

func fixtureCases(c *data.V1Content) [][2]string {
	cs := [][2]string{
		{"wfh: 0 found", q("wfh_admin_fee", a("q1", `"q1_b"`, false), a("q2", `"q2_d"`, false), a("q3", `"q3_c"`, false))},
		{"wfh: 1 found", q("wfh_admin_fee", a("q1", `"q1_a"`, false), a("q2", `"q2_d"`, false), a("q3", `"q3_c"`, false))},
		{"wfh: banyak found, maks 2 opsi", q("wfh_admin_fee", a("q1", `"q1_a"`, false), a("q2", `"q2_a","q2_b"`, false), a("q3", `"q3_e"`, false))},
		{"wfh: hanya Lainnya", q("wfh_admin_fee", a("q1", ``, true), a("q2", ``, true), a("q3", ``, true))},
		{"wfh: semua celah ketemu, kandidat dari katalog", q("wfh_admin_fee", a("q1", `"q1_a","q1_c"`, false), a("q2", `"q2_a"`, false), a("q3", `"q3_e"`, false))},
		{"400: skenario kosong", q("", a("q1", `"q1_a"`, false), a("q2", `"q2_a"`, false), a("q3", `"q3_a"`, false))},
		{"404: skenario tak ada", q("tidak_ada", a("q1", `"q1_a"`, false), a("q2", `"q2_a"`, false), a("q3", `"q3_a"`, false))},
		{"400: hanya 2 jawaban", q("wfh_admin_fee", a("q1", `"q1_a"`, false), a("q2", `"q2_a"`, false))},
		{"400: pertanyaan ganda", q("wfh_admin_fee", a("q1", `"q1_a"`, false), a("q2", `"q2_a"`, false), a("q1", `"q1_a"`, false))},
		{"400: opsi kosong tanpa other_filled", q("wfh_admin_fee", a("q1", ``, false), a("q2", `"q2_a"`, false), a("q3", `"q3_a"`, false))},
		{"400: 3 opsi", q("wfh_admin_fee", a("q1", `"q1_a"`, false), a("q2", `"q2_a","q2_b","q2_c"`, false), a("q3", `"q3_a"`, false))},
		{"400: opsi milik pertanyaan lain", q("wfh_admin_fee", a("q1", `"q1_a"`, false), a("q2", `"q2_a"`, false), a("q3", `"q1_a"`, false))},
		{"400: field tak dikenal", `{"scenario_id":"wfh_admin_fee","answers":[],"text":"x"}`},
	}
	for _, sc := range c.Scenarios {
		cs = append(cs, [2]string{sc.ID + ": opsi pertama tiap pertanyaan", q(sc.ID,
			a("q1", `"q1_a"`, false), a("q2", `"q2_a"`, false), a("q3", `"q3_a"`, false))})
	}
	return cs
}

// UPDATE_FIXTURE=1 go test ./internal/lite menulis ulang fixture; tanpa itu test membandingkan.
func TestFixtureRoundTrip(t *testing.T) {
	c := content(t)
	const path = "../../testdata/fixtures/reflect-v1.json"
	var want []fixture
	for _, cs := range fixtureCases(c) {
		st, out := lite.Handle(c, []byte(cs[1]))
		b, _ := json.Marshal(out)
		want = append(want, fixture{cs[0], json.RawMessage(cs[1]), st, b})
	}
	if os.Getenv("UPDATE_FIXTURE") != "" {
		var buf bytes.Buffer
		enc := json.NewEncoder(&buf)
		enc.SetEscapeHTML(false)
		enc.SetIndent("", "  ")
		_ = enc.Encode(want)
		if err := os.WriteFile(path, buf.Bytes(), 0o644); err != nil {
			t.Fatal(err)
		}
	}
	raw, err := os.ReadFile(path)
	if err != nil {
		t.Fatal(err)
	}
	var got []fixture
	if err := json.Unmarshal(raw, &got); err != nil || len(got) < 10 || len(got) != len(want) {
		t.Fatalf("fixture rusak atau jumlah beda: %v (%d vs %d)", err, len(got), len(want))
	}
	for i, g := range got {
		st, out := lite.Handle(c, g.Request)
		b, _ := json.Marshal(out)
		var x, y any
		_ = json.Unmarshal(g.Response, &x)
		_ = json.Unmarshal(b, &y)
		if st != g.Status || !reflect.DeepEqual(x, y) || g.Name != want[i].Name {
			t.Errorf("fixture %q tidak sinkron dengan engine (jalankan UPDATE_FIXTURE=1)", g.Name)
		}
	}
}
