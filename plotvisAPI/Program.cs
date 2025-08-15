using System.Globalization;

var builder = WebApplication.CreateBuilder(args);

// simple CORS so the Angular app can call the API during dev
builder.Services.AddCors(o =>
{
    o.AddPolicy("dev", p => p
        .AllowAnyOrigin()
        .AllowAnyHeader()
        .AllowAnyMethod());
});

var app = builder.Build();
app.UseCors("dev");

// health check
app.MapGet("/api/health", () => new { ok = true });

// returns series points from a CSV file with header: strain,stress
app.MapGet("/api/curve", (string? path) =>
{
    // default to repo root sample_data if no path provided
    var filePath = string.IsNullOrWhiteSpace(path)
        ? Path.GetFullPath(Path.Combine(AppContext.BaseDirectory, "..", "..", "..", "..", "sample_data", "demo.csv"))
        : path;

    if (!System.IO.File.Exists(filePath))
        return Results.NotFound(new { error = "file not found", filePath });

    var points = new List<Point2D>();
    using var reader = new StreamReader(filePath);
    string? line;
    bool headerSkipped = false;
    while ((line = reader.ReadLine()) != null)
    {
        if (!headerSkipped) { headerSkipped = true; continue; }
        var parts = line.Split(',');
        if (parts.Length < 2) continue;

        if (double.TryParse(parts[0], NumberStyles.Float, CultureInfo.InvariantCulture, out var x) &&
            double.TryParse(parts[1], NumberStyles.Float, CultureInfo.InvariantCulture, out var y))
        {
            points.Add(new Point2D(x, y));
        }
    }

    return Results.Ok(new { series = points });
});

app.Run();

record Point2D(double x, double y);