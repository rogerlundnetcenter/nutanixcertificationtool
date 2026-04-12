namespace CertStudy.Maui;

public partial class App : Application
{
    public App()
    {
        InitializeComponent();
    }

    protected override Window CreateWindow(IActivationState? activationState)
    {
        return new Window(new MainPage())
        {
            Title = "Cert Study Editor",
            MinimumWidth = 1200,
            MinimumHeight = 800
        };
    }
}
