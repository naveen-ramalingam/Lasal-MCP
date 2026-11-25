using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.Json;

namespace LASAL.HMI.Converter.Models;

/// <summary>
/// Validates <see cref="HmiIntermediateModel"/> instances against schema invariants and
/// provides deterministic JSON serialization/deserialization.
/// </summary>
public static class IntermediateSchemaValidator
{
    private static readonly JsonSerializerOptions SerializerOptions = new()
    {
        WriteIndented = true,
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        PropertyNameCaseInsensitive = true
    };

    public static string Serialize(HmiIntermediateModel model)
    {
        ArgumentNullException.ThrowIfNull(model);
        return JsonSerializer.Serialize(model, SerializerOptions);
    }

    public static void SaveToFile(HmiIntermediateModel model, string filePath)
    {
        ArgumentNullException.ThrowIfNull(model);
        var dir = Path.GetDirectoryName(filePath);
        if (!string.IsNullOrEmpty(dir))
        {
            Directory.CreateDirectory(dir);
        }
        File.WriteAllText(filePath, Serialize(model));
    }

    public static HmiIntermediateModel Deserialize(string json)
    {
        if (string.IsNullOrWhiteSpace(json))
        {
            throw new ArgumentException("JSON string cannot be empty.", nameof(json));
        }

        return JsonSerializer.Deserialize<HmiIntermediateModel>(json, SerializerOptions)
               ?? throw new InvalidDataException("Failed to deserialize HmiIntermediateModel.");
    }

    public static HmiIntermediateModel LoadFromFile(string filePath)
    {
        return Deserialize(File.ReadAllText(filePath));
    }

    public static IntermediateValidationResult Validate(HmiIntermediateModel model)
    {
        ArgumentNullException.ThrowIfNull(model);
        var errors = new List<string>();
        var warnings = new List<string>();

        if (string.IsNullOrWhiteSpace(model.SchemaVersion))
        {
            errors.Add("SchemaVersion is required.");
        }

        if (string.IsNullOrWhiteSpace(model.ProjectMetadata.ProjectName))
        {
            errors.Add("ProjectMetadata.ProjectName is required.");
        }

        if (model.ProjectMetadata.ResolutionWidth <= 0 || model.ProjectMetadata.ResolutionHeight <= 0)
        {
            errors.Add($"Invalid project resolution: {model.ProjectMetadata.ResolutionWidth}x{model.ProjectMetadata.ResolutionHeight}.");
        }

        var datapointIds = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        foreach (var dp in model.Datapoints)
        {
            if (string.IsNullOrWhiteSpace(dp.Id))
            {
                errors.Add($"Datapoint '{dp.SymbolPath}' has an empty Id.");
            }
            else if (!datapointIds.Add(dp.Id))
            {
                warnings.Add($"Duplicate Datapoint Id '{dp.Id}' detected.");
            }
        }

        var screenNames = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        foreach (var screen in model.Screens)
        {
            if (string.IsNullOrWhiteSpace(screen.Name))
            {
                errors.Add($"Screen #{screen.ScreenNumber} has an empty Name.");
            }
            else if (!screenNames.Add(screen.Name))
            {
                warnings.Add($"Duplicate Screen Name '{screen.Name}' detected.");
            }

            foreach (var ctrl in screen.Controls)
            {
                if (ctrl.Width <= 0 || ctrl.Height <= 0)
                {
                    warnings.Add($"Control '{ctrl.Name}' on screen '{screen.Name}' has non-positive dimensions ({ctrl.Width}x{ctrl.Height}).");
                }
            }
        }

        return new IntermediateValidationResult(errors.Count == 0, errors, warnings);
    }
}

public sealed record IntermediateValidationResult(
    bool IsValid,
    IReadOnlyList<string> Errors,
    IReadOnlyList<string> Warnings);
