using Microsoft.JSInterop;

namespace CertStudy.Maui.Services;

public class ChartJsService : IAsyncDisposable
{
    private readonly IJSRuntime _js;
    private IJSObjectReference? _module;

    public ChartJsService(IJSRuntime js) => _js = js;

    public async Task InitializeAsync()
    {
        _module = await _js.InvokeAsync<IJSObjectReference>(
            "import", "./js/charts.js");
    }

    public async Task RenderPieAsync(string canvasId, string[] labels, int[] data, string[] colors) =>
        await _module!.InvokeVoidAsync("renderPie", canvasId, labels, data, colors);

    public async Task RenderBarAsync(string canvasId, string[] labels, int[] data, string color) =>
        await _module!.InvokeVoidAsync("renderBar", canvasId, labels, data, color);

    public async ValueTask DisposeAsync()
    {
        if (_module != null) await _module.DisposeAsync();
    }
}
