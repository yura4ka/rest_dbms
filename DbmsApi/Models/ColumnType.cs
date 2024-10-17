namespace DbmsApi.Models
{
	public interface IColumnType
	{
		public abstract string Name { get; }
		public abstract ColumnValue Instance(object? value, bool isNullable);
	}

	public sealed class IntType : IColumnType
	{
		private static IntType? _instance = null;

		private IntType() { }

		public static IntType GetInstance()
		{
			_instance ??= new IntType();
			return _instance;
		}

		public string Name => "Int";

		public ColumnValue Instance(object? value, bool isNullable)
		{
			return new IntValue(value, isNullable);
		}
	}

	public sealed class RealType : IColumnType
	{
		private static RealType? _instance = null;

		private RealType() { }

		public static RealType GetInstance()
		{
			_instance ??= new RealType();
			return _instance;
		}

		public string Name => "Real";

		public ColumnValue Instance(object? value, bool isNullable)
		{
			return new RealValue(value, isNullable);
		}
	}

	public sealed class TextType : IColumnType
	{
		private static TextType? _instance = null;

		private TextType() { }

		public static TextType GetInstance()
		{
			_instance ??= new TextType();
			return _instance;
		}

		public string Name => "Text";

		public ColumnValue Instance(object? value, bool isNullable)
		{
			return new TextValue(value, isNullable);
		}
	}

	public sealed class CharType : IColumnType
	{
		private static CharType? _instance = null;

		private CharType() { }

		public static CharType GetInstance()
		{
			_instance ??= new CharType();
			return _instance;
		}

		public string Name => "Char";

		public ColumnValue Instance(object? value, bool isNullable)
		{
			return new CharValue(value, isNullable);
		}
	}

	public sealed class ComplexIntType : IColumnType
	{
		private static ComplexIntType? _instance = null;

		private ComplexIntType() { }

		public static ComplexIntType GetInstance()
		{
			_instance ??= new ComplexIntType();
			return _instance;
		}

		public string Name => "ComplexInt";

		public ColumnValue Instance(object? value, bool isNullable)
		{
			return new ComplexIntValue(value, isNullable);
		}
	}

	public sealed class ComplexRealType : IColumnType
	{
		private static ComplexRealType? _instance = null;

		private ComplexRealType() { }

		public static ComplexRealType GetInstance()
		{
			_instance ??= new ComplexRealType();
			return _instance;
		}

		public string Name => "ComplexReal";

		public ColumnValue Instance(object? value, bool isNullable)
		{
			return new ComplexRealValue(value, isNullable);
		}
	}

	public static class TypeManager
	{
		public static Dictionary<string, Func<IColumnType>> TypeMappings = new(){
			{ "INT", IntType.GetInstance },
			{ "REAL", RealType.GetInstance },
			{ "TEXT", TextType.GetInstance },
			{ "CHAR", CharType.GetInstance },
			{ "COMPLEXINT", ComplexIntType.GetInstance },
			{ "COMPLEXREAL", ComplexRealType.GetInstance },
		};

		public static List<string> AvailableTypes = ["Int", "Real", "Text", "Char", "ComplexInt", "ComplexReal"];
	}
}
