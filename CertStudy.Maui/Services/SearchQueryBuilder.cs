namespace CertStudy.Maui.Services;

public class SearchQueryBuilder
{
    private readonly List<string> _select = new();
    private string _from = "";
    private readonly List<string> _joins = new();
    private readonly List<string> _wheres = new();
    private readonly List<string> _orderBy = new();
    private int _limit = 50;
    private int _offset = 0;
    private bool _countOnly = false;

    public SearchQueryBuilder Select(params string[] columns)
    {
        _select.AddRange(columns);
        return this;
    }

    public SearchQueryBuilder AddSelect(string column)
    {
        _select.Add(column);
        return this;
    }

    public SearchQueryBuilder SelectCount()
    {
        _countOnly = true;
        _select.Clear();
        return this;
    }

    public SearchQueryBuilder SelectFrom(string table)
    {
        _from = table;
        return this;
    }

    public SearchQueryBuilder Join(string join)
    {
        _joins.Add(join);
        return this;
    }

    public SearchQueryBuilder Where(string condition)
    {
        _wheres.Add(condition);
        return this;
    }

    public SearchQueryBuilder OrderBy(string column)
    {
        _orderBy.Add(column);
        return this;
    }

    public SearchQueryBuilder Limit(int limit)
    {
        _limit = limit;
        return this;
    }

    public SearchQueryBuilder Offset(int offset)
    {
        _offset = offset;
        return this;
    }

    public string Build()
    {
        if (_countOnly)
            return $"SELECT COUNT(*) FROM {_from} {BuildJoins()} {BuildWhere()}";

        var select = _select.Any() ? string.Join(", ", _select) : "*";
        var sql = $"SELECT {select} FROM {_from} {BuildJoins()} {BuildWhere()} {BuildOrderBy()} LIMIT {_limit} OFFSET {_offset}";
        return sql.Trim();
    }

    private string BuildJoins() => _joins.Any() ? string.Join(" ", _joins.Select(j => $"LEFT JOIN {j}")) : "";
    private string BuildWhere() => _wheres.Any() ? $"WHERE {string.Join(" AND ", _wheres)}" : "";
    private string BuildOrderBy() => _orderBy.Any() ? $"ORDER BY {string.Join(", ", _orderBy)}" : "";
}
