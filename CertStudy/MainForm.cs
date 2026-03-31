using System.Drawing.Drawing2D;
using CertStudy.Controls;
using CertStudy.Models;
using CertStudy.Services;

namespace CertStudy;

class MainForm : Form
{
    // ── Data ──
    private readonly Dictionary<string, List<Question>> _exams = new();
    private string _currentExam = "";
    private List<Question> _currentQuestions = new();
    private int _currentIndex;
    private bool _submitted;
    private readonly HashSet<string> _selectedAnswers = new();

    // ── Stats ──
    private int _totalAnswered;
    private int _totalCorrect;
    private int _streak;
    private readonly Dictionary<string, (int answered, int correct)> _domainStats = new();

    // ── Mode ──
    private bool _testMode;
    private int _testTotal = 75;
    private System.Windows.Forms.Timer? _testTimer;
    private int _testSecondsRemaining;

    // ── Layout panels ──
    private Panel _sidePanel = null!;
    private Panel _contentPanel = null!;
    private Panel _headerPanel = null!;
    private Panel _bodyPanel = null!;
    private Panel _questionPanel = null!;
    private Panel _explainPanel = null!;
    private Panel _optionsPanel = null!;
    private Panel _buttonBar = null!;
    private FlowLayoutPanel _examButtonsPanel = null!;

    // ── Controls ──
    private Label _headerLabel = null!;
    private Label _timerLabel = null!;
    private AnimatedProgressBar _progressBar = null!;
    private Label _progressLabel = null!;
    private Label _stemLabel = null!;
    private RichTextBox _explainBox = null!;
    private Label _explainHeader = null!;
    private Label _feedbackLabel = null!;
    private Button _submitBtn = null!;
    private Button _nextBtn = null!;
    private Button _prevBtn = null!;
    private Button _skipBtn = null!;
    private RadioButton _studyModeRadio = null!;
    private RadioButton _testModeRadio = null!;
    private Label _statsLabel = null!;
    private Label _domainStatsLabel = null!;
    private Label _streakLabel = null!;
    private Button _resetBtn = null!;

    private readonly List<Panel> _optionCards = new();
    private readonly List<Label> _optionLabels = new();
    private readonly List<Panel> _optionIndicators = new();

    // ── GDI+ resources ──
    private readonly Pen _scanlinePen = new(Color.FromArgb(8, 0, 0, 0));
    private readonly Font _mainFont = new("Consolas", 10f);
    private readonly Font _mainFontBold = new("Consolas", 10f, FontStyle.Bold);
    private readonly Font _headerFont = new("Consolas", 13f, FontStyle.Bold);
    private readonly Font _titleFont = new("Consolas", 16f, FontStyle.Bold);
    private readonly Font _smallFont = new("Consolas", 9f);
    private readonly Font _explainFont = new("Consolas", 9.5f);

    public MainForm()
    {
        Text = "🎯 Cert Study — Nutanix Exam Prep";
        BackColor = SynthwaveColors.DeepSpace;
        ForeColor = SynthwaveColors.TextPrimary;
        Font = _mainFont;
        WindowState = FormWindowState.Maximized;
        StartPosition = FormStartPosition.CenterScreen;
        MinimumSize = new Size(1200, 700);
        DoubleBuffered = true;
        KeyPreview = true;

        BuildLayout();
        LoadExams();
        WireEvents();

        _progressBar.StartAnimation();
    }

    // ═══════════════════════════════════════════════════════════════
    //  LAYOUT
    // ═══════════════════════════════════════════════════════════════

    private void BuildLayout()
    {
        // ── Side Panel ──
        _sidePanel = new Panel
        {
            Dock = DockStyle.Left,
            Width = 280,
            BackColor = SynthwaveColors.DarkPanel,
            Padding = new Padding(12, 12, 12, 12),
        };
        _sidePanel.Paint += SidePanel_Paint;

        var logoLabel = new Label
        {
            Text = "🎯 CERT STUDY",
            Dock = DockStyle.Top,
            Height = 44,
            Font = _titleFont,
            ForeColor = SynthwaveColors.NeonCyan,
            TextAlign = ContentAlignment.MiddleLeft,
            Padding = new Padding(4, 0, 0, 0),
        };

        var subtitleLabel = new Label
        {
            Text = "Nutanix Exam Prep",
            Dock = DockStyle.Top,
            Height = 22,
            Font = _smallFont,
            ForeColor = SynthwaveColors.TextDim,
            TextAlign = ContentAlignment.TopLeft,
            Padding = new Padding(6, 0, 0, 0),
        };

        var examSectionLabel = MakeSectionLabel("─── EXAMS ───");
        _examButtonsPanel = new FlowLayoutPanel
        {
            Dock = DockStyle.Top,
            FlowDirection = FlowDirection.TopDown,
            AutoSize = true,
            WrapContents = false,
            Padding = new Padding(0),
            BackColor = Color.Transparent,
        };

        var modeSectionLabel = MakeSectionLabel("─── MODE ───");
        _studyModeRadio = MakeRadio("● Study Mode", true);
        _testModeRadio = MakeRadio("○ Test Mode", false);

        var statsSectionLabel = MakeSectionLabel("─── STATS ───");
        _statsLabel = new Label
        {
            Dock = DockStyle.Top,
            Height = 24,
            Font = _mainFont,
            ForeColor = SynthwaveColors.TextPrimary,
            Text = "Score: 0/0 (0%)",
            Padding = new Padding(6, 0, 0, 0),
            BackColor = Color.Transparent,
        };
        _domainStatsLabel = new Label
        {
            Dock = DockStyle.Top,
            Height = 120,
            Font = _smallFont,
            ForeColor = SynthwaveColors.TextDim,
            Padding = new Padding(6, 0, 0, 0),
            BackColor = Color.Transparent,
        };
        _streakLabel = new Label
        {
            Dock = DockStyle.Top,
            Height = 22,
            Font = _smallFont,
            ForeColor = SynthwaveColors.StatusAmber,
            Text = "Current streak: 0",
            Padding = new Padding(6, 0, 0, 0),
            BackColor = Color.Transparent,
        };

        _resetBtn = MakeFlatButton("[ Reset Stats ]", SynthwaveColors.StatusRed);
        _resetBtn.Dock = DockStyle.Top;
        _resetBtn.Height = 32;
        _resetBtn.Margin = new Padding(0, 10, 0, 0);

        // Add to side panel (reverse order because Dock.Top stacks)
        _sidePanel.Controls.Add(_resetBtn);
        _sidePanel.Controls.Add(_streakLabel);
        _sidePanel.Controls.Add(_domainStatsLabel);
        _sidePanel.Controls.Add(_statsLabel);
        _sidePanel.Controls.Add(statsSectionLabel);
        _sidePanel.Controls.Add(_testModeRadio);
        _sidePanel.Controls.Add(_studyModeRadio);
        _sidePanel.Controls.Add(modeSectionLabel);
        _sidePanel.Controls.Add(_examButtonsPanel);
        _sidePanel.Controls.Add(examSectionLabel);
        _sidePanel.Controls.Add(subtitleLabel);
        _sidePanel.Controls.Add(logoLabel);

        // ── Content Panel ──
        _contentPanel = new Panel
        {
            Dock = DockStyle.Fill,
            BackColor = SynthwaveColors.DeepSpace,
            Padding = new Padding(16, 12, 16, 12),
        };

        _headerPanel = new Panel
        {
            Dock = DockStyle.Top,
            Height = 48,
            BackColor = Color.Transparent,
        };

        _headerLabel = new Label
        {
            Text = "Select an exam to begin",
            Dock = DockStyle.Fill,
            Font = _headerFont,
            ForeColor = SynthwaveColors.NeonCyan,
            TextAlign = ContentAlignment.MiddleLeft,
        };

        _timerLabel = new Label
        {
            Text = "",
            Dock = DockStyle.Right,
            Width = 180,
            Font = _headerFont,
            ForeColor = SynthwaveColors.StatusAmber,
            TextAlign = ContentAlignment.MiddleRight,
        };

        _headerPanel.Controls.Add(_headerLabel);
        _headerPanel.Controls.Add(_timerLabel);

        _progressBar = new AnimatedProgressBar
        {
            Dock = DockStyle.Top,
            Height = 8,
            Maximum = 100,
            Value = 0,
        };

        _progressLabel = new Label
        {
            Dock = DockStyle.Top,
            Height = 22,
            Font = _smallFont,
            ForeColor = SynthwaveColors.TextDim,
            TextAlign = ContentAlignment.TopRight,
            Text = "",
        };

        // ── Body: question + explain ──
        _bodyPanel = new Panel
        {
            Dock = DockStyle.Fill,
            BackColor = Color.Transparent,
        };

        _explainPanel = new Panel
        {
            Dock = DockStyle.Right,
            Width = 400,
            BackColor = SynthwaveColors.CardBg,
            Padding = new Padding(12),
        };

        _explainHeader = new Label
        {
            Text = "📖 EXPLAIN THIS QUESTION",
            Dock = DockStyle.Top,
            Height = 32,
            Font = _mainFontBold,
            ForeColor = SynthwaveColors.NeonPurple,
            BackColor = Color.Transparent,
        };

        _explainBox = new RichTextBox
        {
            Dock = DockStyle.Fill,
            BackColor = SynthwaveColors.CardBg,
            ForeColor = SynthwaveColors.TextPrimary,
            Font = _explainFont,
            BorderStyle = BorderStyle.None,
            ReadOnly = true,
            ScrollBars = RichTextBoxScrollBars.Vertical,
            DetectUrls = true,
            Text = "Submit an answer to see the explanation and reference material.",
        };

        _explainPanel.Controls.Add(_explainBox);
        _explainPanel.Controls.Add(_explainHeader);

        // splitter between question and explain
        var splitter = new Splitter
        {
            Dock = DockStyle.Right,
            Width = 4,
            BackColor = SynthwaveColors.DarkPanel,
        };

        _questionPanel = new Panel
        {
            Dock = DockStyle.Fill,
            BackColor = Color.Transparent,
            Padding = new Padding(0, 0, 8, 0),
            AutoScroll = true,
        };

        _stemLabel = new Label
        {
            Dock = DockStyle.Top,
            AutoSize = false,
            Height = 100,
            Font = _mainFont,
            ForeColor = SynthwaveColors.TextPrimary,
            Padding = new Padding(8, 8, 8, 8),
            BackColor = SynthwaveColors.CardBg,
        };

        _optionsPanel = new FlowLayoutPanel
        {
            Dock = DockStyle.Top,
            FlowDirection = FlowDirection.TopDown,
            WrapContents = false,
            AutoSize = true,
            Padding = new Padding(0, 8, 0, 0),
            BackColor = Color.Transparent,
        };

        _feedbackLabel = new Label
        {
            Dock = DockStyle.Top,
            Height = 36,
            Font = _mainFontBold,
            ForeColor = SynthwaveColors.TextPrimary,
            TextAlign = ContentAlignment.MiddleLeft,
            Text = "",
            Padding = new Padding(8, 0, 0, 0),
            BackColor = Color.Transparent,
        };

        _buttonBar = new Panel
        {
            Dock = DockStyle.Top,
            Height = 44,
            BackColor = Color.Transparent,
            Padding = new Padding(0, 6, 0, 6),
        };

        _submitBtn = MakeActionButton("Submit", SynthwaveColors.NeonMagenta);
        _nextBtn = MakeActionButton("Next →", SynthwaveColors.NeonCyan);
        _prevBtn = MakeActionButton("← Prev", SynthwaveColors.NeonPurple);
        _skipBtn = MakeActionButton("Skip", SynthwaveColors.TextDim);

        _submitBtn.Location = new Point(0, 4);
        _nextBtn.Location = new Point(112, 4);
        _prevBtn.Location = new Point(224, 4);
        _skipBtn.Location = new Point(336, 4);

        _buttonBar.Controls.AddRange(new Control[] { _submitBtn, _nextBtn, _prevBtn, _skipBtn });

        _questionPanel.Controls.Add(_feedbackLabel);
        _questionPanel.Controls.Add(_buttonBar);
        _questionPanel.Controls.Add(_optionsPanel);
        _questionPanel.Controls.Add(_stemLabel);

        _bodyPanel.Controls.Add(_questionPanel);
        _bodyPanel.Controls.Add(splitter);
        _bodyPanel.Controls.Add(_explainPanel);

        _contentPanel.Controls.Add(_bodyPanel);
        _contentPanel.Controls.Add(_progressLabel);
        _contentPanel.Controls.Add(_progressBar);
        _contentPanel.Controls.Add(_headerPanel);

        Controls.Add(_contentPanel);
        Controls.Add(_sidePanel);
    }

    // ═══════════════════════════════════════════════════════════════
    //  LOAD EXAMS
    // ═══════════════════════════════════════════════════════════════

    private void LoadExams()
    {
        // The .md files live in C:\copilot\next2026 (parent of the CertStudy project).
        // Try several strategies to locate them.
        string dir = FindMarkdownDirectory();

        try
        {
            var loaded = QuestionParser.LoadAllExams(dir);
            foreach (var kv in loaded.OrderBy(k => k.Key))
                _exams[kv.Key] = kv.Value;
        }
        catch (Exception ex)
        {
            MessageBox.Show($"Could not load exams from {dir}:\n{ex.Message}",
                "Load Error", MessageBoxButtons.OK, MessageBoxIcon.Warning);
        }

        PopulateExamButtons();
    }

    private void PopulateExamButtons()
    {
        _examButtonsPanel.Controls.Clear();
        bool first = true;
        foreach (var kv in _exams)
        {
            var btn = MakeFlatButton($"  {(first ? "▶" : " ")} {kv.Key} ({kv.Value.Count})",
                first ? SynthwaveColors.NeonCyan : SynthwaveColors.TextPrimary);
            btn.Tag = kv.Key;
            btn.Width = 252;
            btn.Height = 32;
            btn.Click += ExamButton_Click;
            _examButtonsPanel.Controls.Add(btn);
            first = false;
        }

        if (_exams.Count > 0)
            SelectExam(_exams.Keys.First());
    }

    // ═══════════════════════════════════════════════════════════════
    //  EVENTS
    // ═══════════════════════════════════════════════════════════════

    private void WireEvents()
    {
        _submitBtn.Click += (_, _) => SubmitAnswer();
        _nextBtn.Click += (_, _) => NavigateNext();
        _prevBtn.Click += (_, _) => NavigatePrev();
        _skipBtn.Click += (_, _) => NavigateNext();
        _resetBtn.Click += (_, _) => ResetStats();
        _studyModeRadio.CheckedChanged += (_, _) => SetMode(false);
        _testModeRadio.CheckedChanged += (_, _) =>
        {
            if (_testModeRadio.Checked) SetMode(true);
        };
        _explainBox.LinkClicked += (_, e) =>
        {
            try
            {
                var link = e.LinkText;
                if (!string.IsNullOrEmpty(link))
                    System.Diagnostics.Process.Start(new System.Diagnostics.ProcessStartInfo(link) { UseShellExecute = true });
            }
            catch { }
        };
        KeyDown += MainForm_KeyDown;
        Resize += (_, _) => AdjustStemHeight();
    }

    private void MainForm_KeyDown(object? sender, KeyEventArgs e)
    {
        if (_currentQuestions.Count == 0) return;

        switch (e.KeyCode)
        {
            case Keys.D1 or Keys.NumPad1: ToggleOption(0); break;
            case Keys.D2 or Keys.NumPad2: ToggleOption(1); break;
            case Keys.D3 or Keys.NumPad3: ToggleOption(2); break;
            case Keys.D4 or Keys.NumPad4: ToggleOption(3); break;
            case Keys.D5 or Keys.NumPad5: ToggleOption(4); break;
            case Keys.Enter: SubmitAnswer(); break;
            case Keys.N: NavigateNext(); break;
            case Keys.P: NavigatePrev(); break;
        }
        e.Handled = true;
    }

    private void ExamButton_Click(object? sender, EventArgs e)
    {
        if (sender is Button btn && btn.Tag is string exam)
        {
            StopTestTimer();
            SelectExam(exam);
        }
    }

    // ═══════════════════════════════════════════════════════════════
    //  EXAM SELECTION & NAVIGATION
    // ═══════════════════════════════════════════════════════════════

    private void SelectExam(string examCode)
    {
        if (!_exams.TryGetValue(examCode, out var questions)) return;
        _currentExam = examCode;
        _currentQuestions = _testMode
            ? questions.OrderBy(_ => Random.Shared.Next()).Take(_testTotal).ToList()
            : new List<Question>(questions);

        _currentIndex = 0;
        _submitted = false;

        // highlight active exam button
        foreach (Control c in _examButtonsPanel.Controls)
        {
            if (c is Button b)
            {
                bool active = (string)b.Tag! == examCode;
                b.ForeColor = active ? SynthwaveColors.NeonCyan : SynthwaveColors.TextPrimary;
                b.Text = $"  {(active ? "▶" : " ")} {b.Tag} ({_exams[(string)b.Tag!].Count})";
            }
        }

        _progressBar.Maximum = _currentQuestions.Count;
        ShowQuestion();

        if (_testMode) StartTestTimer();
    }

    private void NavigateNext()
    {
        if (_currentQuestions.Count == 0) return;
        if (_currentIndex < _currentQuestions.Count - 1)
        {
            _currentIndex++;
            _submitted = false;
            ShowQuestion();
        }
        else if (_testMode)
        {
            FinishTest();
        }
    }

    private void NavigatePrev()
    {
        if (_currentQuestions.Count == 0 || _currentIndex <= 0) return;
        _currentIndex--;
        _submitted = false;
        ShowQuestion();
    }

    // ═══════════════════════════════════════════════════════════════
    //  DISPLAY QUESTION
    // ═══════════════════════════════════════════════════════════════

    private void ShowQuestion()
    {
        if (_currentQuestions.Count == 0) return;
        var q = _currentQuestions[_currentIndex];

        _headerLabel.Text = $"{_currentExam} — Question {_currentIndex + 1} of {_currentQuestions.Count}";
        _progressBar.Value = _currentIndex + 1;
        _progressLabel.Text = $"{_currentIndex + 1}/{_currentQuestions.Count}  •  {q.Domain}";

        // stem
        var multiHint = q.IsMultiSelect ? "  [Select ALL that apply]" : "";
        _stemLabel.Text = $"Q{q.Id}: {q.Stem}{multiHint}";
        AdjustStemHeight();

        // clear previous
        _feedbackLabel.Text = "";
        _selectedAnswers.Clear();
        _submitted = false;
        _explainBox.Text = "Submit an answer to see the explanation.";

        BuildOptionCards(q);
    }

    private void AdjustStemHeight()
    {
        if (_stemLabel == null || _questionPanel == null) return;
        using var g = _stemLabel.CreateGraphics();
        var size = g.MeasureString(_stemLabel.Text, _stemLabel.Font,
            _questionPanel.ClientSize.Width - 40);
        _stemLabel.Height = Math.Max(60, (int)size.Height + 24);
    }

    private void BuildOptionCards(Question q)
    {
        _optionsPanel.SuspendLayout();
        _optionsPanel.Controls.Clear();
        _optionCards.Clear();
        _optionLabels.Clear();
        _optionIndicators.Clear();

        int cardWidth = Math.Max(400, _questionPanel.ClientSize.Width - 40);

        for (int i = 0; i < q.Options.Count; i++)
        {
            var opt = q.Options[i];
            int idx = i;

            var card = new Panel
            {
                Width = cardWidth,
                Height = 46,
                BackColor = SynthwaveColors.CardBg,
                Margin = new Padding(0, 3, 0, 3),
                Cursor = Cursors.Hand,
                Tag = idx,
            };
            card.SetDoubleBuffered();

            var indicator = new Panel
            {
                Width = 28,
                Height = 28,
                Location = new Point(8, 9),
                BackColor = SynthwaveColors.DarkPanel,
                Tag = opt.Letter,
            };
            indicator.Paint += IndicatorPaint;

            var lbl = new Label
            {
                Text = $"{opt.Letter}) {opt.Text}",
                Location = new Point(44, 4),
                Width = cardWidth - 56,
                Height = 38,
                Font = _mainFont,
                ForeColor = SynthwaveColors.TextPrimary,
                BackColor = Color.Transparent,
                Cursor = Cursors.Hand,
                TextAlign = ContentAlignment.MiddleLeft,
            };

            // auto-height for long options
            using (var g = CreateGraphics())
            {
                var sz = g.MeasureString(lbl.Text, lbl.Font, lbl.Width);
                if (sz.Height > 38)
                {
                    int h = (int)sz.Height + 12;
                    lbl.Height = h;
                    card.Height = h + 8;
                    indicator.Location = new Point(8, (card.Height - 28) / 2);
                }
            }

            // click handlers
            void OnClick(object? s, EventArgs e) => ToggleOption(idx);
            card.Click += OnClick;
            lbl.Click += OnClick;
            indicator.Click += OnClick;

            // hover effect
            void OnEnter(object? s, EventArgs e)
            {
                if (!_submitted) card.BackColor = SynthwaveColors.CardHover;
            }
            void OnLeave(object? s, EventArgs e)
            {
                if (!_submitted && !_selectedAnswers.Contains(opt.Letter))
                    card.BackColor = SynthwaveColors.CardBg;
                else if (!_submitted)
                    card.BackColor = Color.FromArgb(40, 20, 80);
            }
            card.MouseEnter += OnEnter;
            lbl.MouseEnter += OnEnter;
            indicator.MouseEnter += OnEnter;
            card.MouseLeave += OnLeave;
            lbl.MouseLeave += OnLeave;
            indicator.MouseLeave += OnLeave;

            card.Controls.Add(lbl);
            card.Controls.Add(indicator);
            _optionsPanel.Controls.Add(card);
            _optionCards.Add(card);
            _optionLabels.Add(lbl);
            _optionIndicators.Add(indicator);
        }

        _optionsPanel.ResumeLayout(true);
    }

    private static void IndicatorPaint(object? sender, PaintEventArgs e)
    {
        if (sender is not Panel p) return;
        e.Graphics.SmoothingMode = SmoothingMode.AntiAlias;
        var rect = new Rectangle(2, 2, p.Width - 5, p.Height - 5);
        using var pen = new Pen(SynthwaveColors.NeonPurple, 2);
        e.Graphics.DrawEllipse(pen, rect);
        using var brush = new SolidBrush(SynthwaveColors.TextPrimary);
        var sf = new StringFormat { Alignment = StringAlignment.Center, LineAlignment = StringAlignment.Center };
        e.Graphics.DrawString(p.Tag?.ToString() ?? "", new Font("Consolas", 9f, FontStyle.Bold),
            brush, new RectangleF(0, 0, p.Width, p.Height), sf);
    }

    private void ToggleOption(int idx)
    {
        if (_submitted || idx < 0 || idx >= _optionCards.Count) return;
        var q = _currentQuestions[_currentIndex];
        var letter = q.Options[idx].Letter;

        if (q.IsMultiSelect)
        {
            if (_selectedAnswers.Contains(letter))
            {
                _selectedAnswers.Remove(letter);
                _optionCards[idx].BackColor = SynthwaveColors.CardBg;
            }
            else
            {
                _selectedAnswers.Add(letter);
                _optionCards[idx].BackColor = Color.FromArgb(40, 20, 80);
            }
        }
        else
        {
            _selectedAnswers.Clear();
            _selectedAnswers.Add(letter);
            for (int i = 0; i < _optionCards.Count; i++)
                _optionCards[i].BackColor = i == idx
                    ? Color.FromArgb(40, 20, 80)
                    : SynthwaveColors.CardBg;
        }
    }

    // ═══════════════════════════════════════════════════════════════
    //  SUBMIT & SCORING
    // ═══════════════════════════════════════════════════════════════

    private void SubmitAnswer()
    {
        if (_submitted || _currentQuestions.Count == 0 || _selectedAnswers.Count == 0)
            return;

        _submitted = true;
        var q = _currentQuestions[_currentIndex];
        var correct = new HashSet<string>(q.CorrectAnswers);
        bool isCorrect = _selectedAnswers.SetEquals(correct);

        // Update stats
        _totalAnswered++;
        if (isCorrect)
        {
            _totalCorrect++;
            _streak++;
        }
        else
        {
            _streak = 0;
        }

        // domain stats
        if (!_domainStats.ContainsKey(q.Domain))
            _domainStats[q.Domain] = (0, 0);
        var ds = _domainStats[q.Domain];
        _domainStats[q.Domain] = (ds.answered + 1, ds.correct + (isCorrect ? 1 : 0));

        // Color the cards
        for (int i = 0; i < _optionCards.Count; i++)
        {
            var letter = q.Options[i].Letter;
            if (correct.Contains(letter))
            {
                _optionCards[i].BackColor = Color.FromArgb(15, 60, 10);
                _optionLabels[i].ForeColor = SynthwaveColors.StatusGreen;
            }
            else if (_selectedAnswers.Contains(letter))
            {
                _optionCards[i].BackColor = Color.FromArgb(60, 15, 15);
                _optionLabels[i].ForeColor = SynthwaveColors.StatusRed;
            }
        }

        _feedbackLabel.Text = isCorrect
            ? $"✅ Correct! {string.Join(", ", correct)} is right."
            : $"❌ Incorrect. Correct answer: {string.Join(", ", correct)}";
        _feedbackLabel.ForeColor = isCorrect ? SynthwaveColors.StatusGreen : SynthwaveColors.StatusRed;

        ShowExplanation(q);
        UpdateStats();
    }

    private void ShowExplanation(Question q)
    {
        _explainBox.Clear();
        _explainBox.SelectionFont = _mainFontBold;
        _explainBox.SelectionColor = SynthwaveColors.NeonCyan;
        _explainBox.AppendText("EXPLANATION\n");

        _explainBox.SelectionFont = _explainFont;
        _explainBox.SelectionColor = SynthwaveColors.TextPrimary;
        _explainBox.AppendText(string.IsNullOrEmpty(q.Explanation)
            ? "(No explanation provided)\n"
            : q.Explanation + "\n");

        var reference = ReferenceService.GetReferenceForQuestion(q);
        if (!string.IsNullOrEmpty(reference))
        {
            _explainBox.AppendText("\n");
            _explainBox.SelectionFont = _mainFontBold;
            _explainBox.SelectionColor = SynthwaveColors.NeonPurple;
            _explainBox.AppendText("REFERENCE MATERIAL\n");
            _explainBox.SelectionFont = _explainFont;
            _explainBox.SelectionColor = SynthwaveColors.TextDim;
            _explainBox.AppendText(reference + "\n");
        }

        // ── KB / Documentation Links ──
        var kbLinks = ReferenceService.GetKBLinksForQuestion(q);
        if (kbLinks.Count > 0)
        {
            _explainBox.AppendText("\n");
            _explainBox.SelectionFont = _mainFontBold;
            _explainBox.SelectionColor = SynthwaveColors.NeonCyan;
            _explainBox.AppendText("\U0001F4DA RELEVANT DOCUMENTATION\n");
            _explainBox.SelectionFont = _explainFont;
            _explainBox.SelectionColor = SynthwaveColors.TextDim;
            _explainBox.AppendText("\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n");

            foreach (var (title, url) in kbLinks)
            {
                _explainBox.SelectionFont = _mainFontBold;
                _explainBox.SelectionColor = SynthwaveColors.NeonCyan;
                _explainBox.AppendText("\u2022 " + title + "\n");
                _explainBox.SelectionFont = _explainFont;
                _explainBox.SelectionColor = SynthwaveColors.TextDim;
                _explainBox.AppendText("  " + url + "\n");
            }
        }

        // ── General Resources ──
        _explainBox.AppendText("\n");
        _explainBox.SelectionFont = _mainFontBold;
        _explainBox.SelectionColor = SynthwaveColors.NeonCyan;
        _explainBox.AppendText("\U0001F517 GENERAL RESOURCES\n");
        _explainBox.SelectionFont = _explainFont;
        _explainBox.SelectionColor = SynthwaveColors.TextDim;
        _explainBox.AppendText("\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n");

        foreach (var (title, url) in ReferenceService.GetGeneralResources())
        {
            _explainBox.SelectionFont = _mainFontBold;
            _explainBox.SelectionColor = SynthwaveColors.NeonCyan;
            _explainBox.AppendText("\u2022 " + title + "\n");
            _explainBox.SelectionFont = _explainFont;
            _explainBox.SelectionColor = SynthwaveColors.TextDim;
            _explainBox.AppendText("  " + url + "\n");
        }

        _explainBox.SelectionStart = 0;
        _explainBox.ScrollToCaret();
    }

    private void UpdateStats()
    {
        double pct = _totalAnswered > 0 ? 100.0 * _totalCorrect / _totalAnswered : 0;
        _statsLabel.Text = $"Score: {_totalCorrect}/{_totalAnswered} ({pct:F0}%)";
        _statsLabel.ForeColor = pct >= 75 ? SynthwaveColors.StatusGreen
            : pct >= 50 ? SynthwaveColors.StatusAmber
            : SynthwaveColors.StatusRed;

        _streakLabel.Text = $"Current streak: {_streak}";

        var lines = new List<string>();
        foreach (var kv in _domainStats.OrderBy(k => k.Key))
        {
            double dp = kv.Value.answered > 0 ? 100.0 * kv.Value.correct / kv.Value.answered : 0;
            // truncate long domain names
            var name = kv.Key.Length > 28 ? kv.Key[..28] + "…" : kv.Key;
            lines.Add($"{name}: {dp:F0}%");
        }
        _domainStatsLabel.Text = string.Join("\n", lines);
    }

    private void ResetStats()
    {
        _totalAnswered = 0;
        _totalCorrect = 0;
        _streak = 0;
        _domainStats.Clear();
        _statsLabel.Text = "Score: 0/0 (0%)";
        _statsLabel.ForeColor = SynthwaveColors.TextPrimary;
        _domainStatsLabel.Text = "";
        _streakLabel.Text = "Current streak: 0";
    }

    // ═══════════════════════════════════════════════════════════════
    //  TEST MODE
    // ═══════════════════════════════════════════════════════════════

    private void SetMode(bool test)
    {
        _testMode = test;
        StopTestTimer();
        if (_testMode)
        {
            _studyModeRadio.Text = "○ Study Mode";
            _testModeRadio.Text = "● Test Mode";
        }
        else
        {
            _studyModeRadio.Text = "● Study Mode";
            _testModeRadio.Text = "○ Test Mode";
        }
        _timerLabel.Text = "";

        if (!string.IsNullOrEmpty(_currentExam))
            SelectExam(_currentExam);
    }

    private void StartTestTimer()
    {
        _testSecondsRemaining = 120 * 60; // 120 minutes
        ResetStats();
        _testTimer?.Dispose();
        _testTimer = new System.Windows.Forms.Timer { Interval = 1000 };
        _testTimer.Tick += (_, _) =>
        {
            _testSecondsRemaining--;
            int min = _testSecondsRemaining / 60;
            int sec = _testSecondsRemaining % 60;
            _timerLabel.Text = $"⏱ {min:D2}:{sec:D2}";
            if (_testSecondsRemaining <= 300)
                _timerLabel.ForeColor = SynthwaveColors.StatusRed;
            if (_testSecondsRemaining <= 0)
                FinishTest();
        };
        _testTimer.Start();
    }

    private void StopTestTimer()
    {
        _testTimer?.Stop();
        _testTimer?.Dispose();
        _testTimer = null;
        _timerLabel.Text = "";
        _timerLabel.ForeColor = SynthwaveColors.StatusAmber;
    }

    private void FinishTest()
    {
        StopTestTimer();
        double pct = _totalAnswered > 0 ? 100.0 * _totalCorrect / _totalAnswered : 0;
        string result = pct >= 75 ? "PASSED ✅" : "FAILED ❌";
        MessageBox.Show(
            $"Test Complete!\n\n" +
            $"Score: {_totalCorrect}/{_totalAnswered} ({pct:F1}%)\n" +
            $"Result: {result}\n\n" +
            $"Passing score: 75%",
            "Test Results",
            MessageBoxButtons.OK,
            pct >= 75 ? MessageBoxIcon.Information : MessageBoxIcon.Warning);
    }

    // ═══════════════════════════════════════════════════════════════
    //  PAINTING
    // ═══════════════════════════════════════════════════════════════

    private void SidePanel_Paint(object? sender, PaintEventArgs e)
    {
        // scanline overlay
        for (int y = 0; y < _sidePanel.Height; y += 3)
            e.Graphics.DrawLine(_scanlinePen, 0, y, _sidePanel.Width, y);
    }

    // ═══════════════════════════════════════════════════════════════
    //  HELPERS
    // ═══════════════════════════════════════════════════════════════

    private static string FindMarkdownDirectory()
    {
        // 1) Known hard-coded path
        const string known = @"C:\copilot\next2026";
        if (Directory.Exists(known) && Directory.GetFiles(known, "NCP-US*.md").Length > 0)
            return known;

        // 2) Walk up from the executable directory looking for .md files
        var search = AppContext.BaseDirectory;
        for (int i = 0; i < 8 && search != null; i++)
        {
            search = Path.GetDirectoryName(search);
            if (search != null && Directory.Exists(search)
                && Directory.GetFiles(search, "NCP-US*.md").Length > 0)
                return search;
        }

        // 3) Walk up from current working directory
        search = Directory.GetCurrentDirectory();
        for (int i = 0; i < 5 && search != null; i++)
        {
            if (Directory.GetFiles(search, "NCP-US*.md").Length > 0)
                return search;
            search = Path.GetDirectoryName(search);
        }

        return known; // fallback
    }

    private Label MakeSectionLabel(string text)
    {
        return new Label
        {
            Text = text,
            Dock = DockStyle.Top,
            Height = 30,
            Font = _smallFont,
            ForeColor = SynthwaveColors.NeonPurple,
            TextAlign = ContentAlignment.BottomLeft,
            Padding = new Padding(6, 0, 0, 0),
            BackColor = Color.Transparent,
        };
    }

    private RadioButton MakeRadio(string text, bool isChecked)
    {
        return new RadioButton
        {
            Text = text,
            Dock = DockStyle.Top,
            Height = 26,
            Font = _mainFont,
            ForeColor = SynthwaveColors.TextPrimary,
            Checked = isChecked,
            FlatStyle = FlatStyle.Flat,
            BackColor = Color.Transparent,
            Cursor = Cursors.Hand,
        };
    }

    private static Button MakeFlatButton(string text, Color fg)
    {
        var btn = new Button
        {
            Text = text,
            Height = 32,
            FlatStyle = FlatStyle.Flat,
            BackColor = SynthwaveColors.CardBg,
            ForeColor = fg,
            Font = new Font("Consolas", 10f),
            Cursor = Cursors.Hand,
            TextAlign = ContentAlignment.MiddleLeft,
        };
        btn.FlatAppearance.BorderSize = 0;
        btn.FlatAppearance.MouseOverBackColor = SynthwaveColors.CardHover;
        btn.FlatAppearance.MouseDownBackColor = SynthwaveColors.CardPress;
        return btn;
    }

    private static Button MakeActionButton(string text, Color fg)
    {
        var btn = new Button
        {
            Text = text,
            Size = new Size(104, 34),
            FlatStyle = FlatStyle.Flat,
            BackColor = SynthwaveColors.CardBg,
            ForeColor = fg,
            Font = new Font("Consolas", 10f, FontStyle.Bold),
            Cursor = Cursors.Hand,
        };
        btn.FlatAppearance.BorderColor = fg;
        btn.FlatAppearance.BorderSize = 1;
        btn.FlatAppearance.MouseOverBackColor = SynthwaveColors.CardHover;
        btn.FlatAppearance.MouseDownBackColor = SynthwaveColors.CardPress;
        return btn;
    }

    // ═══════════════════════════════════════════════════════════════
    //  DISPOSE
    // ═══════════════════════════════════════════════════════════════

    protected override void Dispose(bool disposing)
    {
        if (disposing)
        {
            _scanlinePen.Dispose();
            _mainFont.Dispose();
            _mainFontBold.Dispose();
            _headerFont.Dispose();
            _titleFont.Dispose();
            _smallFont.Dispose();
            _explainFont.Dispose();
            _testTimer?.Dispose();
            _progressBar?.Dispose();
        }
        base.Dispose(disposing);
    }
}

// ── Extension for double-buffering ──
static class ControlExtensions
{
    public static void SetDoubleBuffered(this Control c)
    {
        typeof(Control)
            .GetProperty("DoubleBuffered",
                System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance)!
            .SetValue(c, true);
    }
}
