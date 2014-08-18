{
    "localIds" : [],
    "nodes" : [{
        "name" : "Node",
        "meta" : "struct",
        "id" : "16610026722781537303",
        "dataWordCount" : 8,
        "pointerCount" : 5,
        "discriminantCount" : 26,
        "discriminantOffset" : 6,
        "fields" : [{
            "name" : "id",
            "type" : "UInt64",
            "offset" : 0
        }, {
            "name" : "displayName",
            "type" : "Text",
            "offset" : 0
        }, {
            "name" : "displayNamePrefixLength",
            "type" : "UInt32",
            "offset" : 2
        }, {
            "name" : "scopeId",
            "type" : "UInt64",
            "offset" : 2
        }, {
            "name" : "nestedNodes",
            "meta" : "list",
            "type" : {
                "meta" : "struct",
                "id" : "16050641862814319170"
            },
            "offset" : 1
        }, {
            "name" : "annotations",
            "meta" : "list",
            "type" : {
                "meta" : "struct",
                "id" : "17422339044421236034"
            },
            "offset" : 2
        }, {
            "name" : "file",
            "type" : "Void",
            "discriminantValue" : 0,
            "offset" : 0
        }, {
            "name" : "struct",
            "type" : "group",
            "discriminantValue" : 1,
            "fields" : [{
                "name" : "dataWordCount",
                "type" : "UInt16",
                "offset" : 7
            }, {
                "name" : "pointerCount",
                "type" : "UInt16",
                "offset" : 12
            }, {
                "name" : "preferredListEncoding",
                "type" : "enum",
                "offset" : 13
            }, {
                "name" : "isGroup",
                "type" : "Bool",
                "offset" : 224
            }, {
                "name" : "discriminantCount",
                "type" : "UInt16",
                "offset" : 15
            }, {
                "name" : "discriminantOffset",
                "type" : "UInt32",
                "offset" : 8
            }, {
                "name" : "fields",
                "meta" : "list",
                "type" : {
                    "meta" : "struct",
                    "id" : "11145653318641710175"
                },
                "offset" : 3
            }]
        }, {
            "name" : "enum",
            "type" : "group",
            "discriminantValue" : 2,
            "fields" : [{
                "name" : "enumerants",
                "meta" : "list",
                "type" : {
                    "meta" : "struct",
                    "id" : "10919677598968879693"
                },
                "offset" : 3
            }]
        }, {
            "name" : "interface",
            "type" : "group",
            "discriminantValue" : 3,
            "fields" : [{
                "name" : "methods",
                "meta" : "list",
                "type" : {
                    "meta" : "struct",
                    "id" : "10736806783679155584"
                },
                "offset" : 3
            }, {
                "name" : "extends",
                "meta" : "list",
                "type" : "UInt64",
                "offset" : 4
            }]
        }, {
            "name" : "const",
            "type" : "group",
            "discriminantValue" : 4,
            "fields" : [{
                "name" : "type",
                "meta" : "struct",
                "id" : "15020482145304562784",
                "offset" : 3
            }, {
                "name" : "value",
                "meta" : "struct",
                "id" : "14853958794117909659",
                "offset" : 4
            }]
        }, {
            "name" : "annotation",
            "type" : "group",
            "discriminantValue" : 5,
            "fields" : [{
                "name" : "type",
                "meta" : "struct",
                "id" : "15020482145304562784",
                "offset" : 3
            }, {
                "name" : "targetsFile",
                "type" : "Bool",
                "offset" : 112
            }, {
                "name" : "targetsConst",
                "type" : "Bool",
                "offset" : 113
            }, {
                "name" : "targetsEnum",
                "type" : "Bool",
                "offset" : 114
            }, {
                "name" : "targetsEnumerant",
                "type" : "Bool",
                "offset" : 115
            }, {
                "name" : "targetsStruct",
                "type" : "Bool",
                "offset" : 116
            }, {
                "name" : "targetsField",
                "type" : "Bool",
                "offset" : 117
            }, {
                "name" : "targetsUnion",
                "type" : "Bool",
                "offset" : 118
            }, {
                "name" : "targetsGroup",
                "type" : "Bool",
                "offset" : 119
            }, {
                "name" : "targetsInterface",
                "type" : "Bool",
                "offset" : 120
            }, {
                "name" : "targetsMethod",
                "type" : "Bool",
                "offset" : 121
            }, {
                "name" : "targetsParam",
                "type" : "Bool",
                "offset" : 122
            }, {
                "name" : "targetsAnnotation",
                "type" : "Bool",
                "offset" : 123
            }]
        }],
        "nodes" : [{
            "name" : "NestedNode",
            "meta" : "struct",
            "id" : "16050641862814319170",
            "dataWordCount" : 1,
            "pointerCount" : 1,
            "discriminantCount" : 0,
            "fields" : [{
                "name" : "name",
                "type" : "Text",
                "offset" : 0
            }, {
                "name" : "id",
                "type" : "UInt64",
                "offset" : 0
            }]
        }]
    }, {
        "name" : "Field",
        "meta" : "struct",
        "id" : "11145653318641710175",
        "dataWordCount" : 3,
        "pointerCount" : 4,
        "discriminantCount" : 5,
        "discriminantOffset" : 4,
        "fields" : [{
            "name" : "name",
            "type" : "Text",
            "offset" : 0
        }, {
            "name" : "codeOrder",
            "type" : "UInt16",
            "offset" : 0
        }, {
            "name" : "annotations",
            "meta" : "list",
            "type" : {
                "meta" : "struct",
                "id" : "17422339044421236034"
            },
            "offset" : 1
        }, {
            "name" : "discriminantValue",
            "type" : "UInt16",
            "defaultValue" : 65535,
            "offset" : 1
        }, {
            "name" : "slot",
            "type" : "group",
            "discriminantValue" : 0,
            "fields" : [{
                "name" : "offset",
                "type" : "UInt32",
                "offset" : 1
            }, {
                "name" : "type",
                "meta" : "struct",
                "id" : "15020482145304562784",
                "offset" : 2
            }, {
                "name" : "defaultValue",
                "meta" : "struct",
                "id" : "14853958794117909659",
                "offset" : 3
            }, {
                "name" : "hadExplicitDefault",
                "type" : "Bool",
                "offset" : 128
            }]
        }, {
            "name" : "group",
            "type" : "group",
            "discriminantValue" : 1,
            "fields" : [{
                "name" : "typeId",
                "type" : "UInt64",
                "offset" : 2
            }]
        }, {
            "name" : "ordinal",
            "type" : "group",
            "discriminantCount" : 2,
            "discriminantOffset" : 5,
            "fields" : [{
                "name" : "implicit",
                "type" : "Void",
                "discriminantValue" : 0,
                "offset" : 0
            }, {
                "name" : "explicit",
                "type" : "UInt16",
                "discriminantValue" : 1,
                "offset" : 6
            }]
        }],
        "nodes" : [{
            "name" : "noDiscriminant",
            "meta" : "const",
            "id" : "10930602151629473554",
            "type" : "UInt16",
            "value" : 65535
        }]
    }, {
        "name" : "Enumerant",
        "meta" : "struct",
        "id" : "10919677598968879693",
        "dataWordCount" : 1,
        "pointerCount" : 2,
        "fields" : [{
            "name" : "name",
            "type" : "Text",
            "offset" : 0
        }, {
            "name" : "codeOrder",
            "type" : "UInt16",
            "offset" : 0
        }, {
            "name" : "annotations",
            "meta" : "list",
            "type" : {
                "meta" : "struct",
                "id" : "17422339044421236034"
            },
            "offset" : 1
        }]
    }, {
        "name" : "Method",
        "meta" : "struct",
        "id" : "10736806783679155584",
        "dataWordCount" : 3,
        "pointerCount" : 2,
        "fields" : [{
            "name" : "name",
            "type" : "Text",
            "offset" : 0
        }, {
            "name" : "codeOrder",
            "type" : "UInt16",
            "offset" : 0
        }, {
            "name" : "paramStructType",
            "type" : "UInt64",
            "offset" : 1
        }, {
            "name" : "resultStructType",
            "type" : "UInt64",
            "offset" : 2
        }, {
            "name" : "annotations",
            "meta" : "list",
            "type" : {
                "meta" : "struct",
                "id" : "17422339044421236034"
            },
            "offset" : 1
        }]
    }, {
        "name" : "Type",
        "meta" : "struct",
        "id" : "15020482145304562784",
        "dataWordCount" : 2,
        "pointerCount" : 1,
        "discriminantCount" : 19,
        "discriminantOffset" : 0,
        "fields" : [{
            "name" : "void",
            "type" : "Void",
            "discriminantValue" : 0,
            "offset" : 0
        }, {
            "name" : "bool",
            "type" : "Void",
            "discriminantValue" : 1,
            "offset" : 0
        }, {
            "name" : "int8",
            "type" : "Void",
            "discriminantValue" : 2,
            "offset" : 0
        }, {
            "name" : "int16",
            "type" : "Void",
            "discriminantValue" : 3,
            "offset" : 0
        }, {
            "name" : "int32",
            "type" : "Void",
            "discriminantValue" : 4,
            "offset" : 0
        }, {
            "name" : "int64",
            "type" : "Void",
            "discriminantValue" : 5,
            "offset" : 0
        }, {
            "name" : "uint8",
            "type" : "Void",
            "discriminantValue" : 6,
            "offset" : 0
        }, {
            "name" : "uint16",
            "type" : "Void",
            "discriminantValue" : 7,
            "offset" : 0
        }, {
            "name" : "uint32",
            "type" : "Void",
            "discriminantValue" : 8,
            "offset" : 0
        }, {
            "name" : "uint64",
            "type" : "Void",
            "discriminantValue" : 9,
            "offset" : 0
        }, {
            "name" : "float32",
            "type" : "Void",
            "discriminantValue" : 10,
            "offset" : 0
        }, {
            "name" : "float64",
            "type" : "Void",
            "discriminantValue" : 11,
            "offset" : 0
        }, {
            "name" : "text",
            "type" : "Void",
            "discriminantValue" : 12,
            "offset" : 0
        }, {
            "name" : "data",
            "type" : "Void",
            "discriminantValue" : 13,
            "offset" : 0
        }, {
            "name" : "list",
            "type" : "group",
            "discriminantValue" : 14,
            "fields" : [{
                "name" : "elementType",
                "meta" : "struct",
                "id" : "15020482145304562784",
                "offset" : 0
            }]
        }, {
            "name" : "enum",
            "type" : "group",
            "discriminantValue" : 15,
            "fields" : [{
                "name" : "typeId",
                "type" : "UInt64",
                "offset" : 1
            }]
        }, {
            "name" : "struct",
            "type" : "group",
            "discriminantValue" : 16,
            "fields" : [{
                "name" : "typeId",
                "type" : "UInt64",
                "offset" : 1
            }]
        }, {
            "name" : "interface",
            "type" : "group",
            "discriminantValue" : 17,
            "fields" : [{
                "name" : "typeId",
                "type" : "UInt64",
                "offset" : 1
            }]
        }, {
            "name" : "anyPointer",
            "type" : "Void",
            "discriminantValue" : 18,
            "offset" : 0
        }]
    }, {
        "name" : "Value",
        "meta" : "struct",
        "id" : "14853958794117909659",
        "dataWordCount" : 2,
        "pointerCount" : 1,
        "discriminantCount" : 19,
        "discriminantOffset" : 0,
        "fields" : [{
            "name" : "void",
            "type" : "Void",
            "discriminantValue" : 0,
            "offset" : 0
        }, {
            "name" : "bool",
            "type" : "Void",
            "discriminantValue" : 1,
            "offset" : 0
        }, {
            "name" : "int8",
            "type" : "Void",
            "discriminantValue" : 2,
            "offset" : 0
        }, {
            "name" : "int16",
            "type" : "Void",
            "discriminantValue" : 3,
            "offset" : 0
        }, {
            "name" : "int32",
            "type" : "Void",
            "discriminantValue" : 4,
            "offset" : 0
        }, {
            "name" : "int64",
            "type" : "Void",
            "discriminantValue" : 5,
            "offset" : 0
        }, {
            "name" : "uint8",
            "type" : "Void",
            "discriminantValue" : 6,
            "offset" : 0
        }, {
            "name" : "uint16",
            "type" : "Void",
            "discriminantValue" : 7,
            "offset" : 0
        }, {
            "name" : "uint32",
            "type" : "Void",
            "discriminantValue" : 8,
            "offset" : 0
        }, {
            "name" : "uint64",
            "type" : "Void",
            "discriminantValue" : 9,
            "offset" : 0
        }, {
            "name" : "float32",
            "type" : "Void",
            "discriminantValue" : 10,
            "offset" : 0
        }, {
            "name" : "float64",
            "type" : "Void",
            "discriminantValue" : 11,
            "offset" : 0
        }, {
            "name" : "text",
            "type" : "Void",
            "discriminantValue" : 12,
            "offset" : 0
        }, {
            "name" : "data",
            "type" : "Void",
            "discriminantValue" : 13,
            "offset" : 0
        }, {
            "name" : "list",
            "type" : "AnyPointer",
            "discriminantValue" : 14,
            "offset" : 0
        }, {
            "name" : "enum",
            "type" : "UInt16",
            "discriminantValue" : 15,
            "offset" : 1
        }, {
            "name" : "struct",
            "type" : "AnyPointer",
            "discriminantValue" : 16,
            "offset" : 0
        }, {
            "name" : "interface",
            "type" : "Void",
            "discriminantValue" : 17,
            "offset" : 0
        }, {
            "name" : "anyPointer",
            "type" : "AnyPointer",
            "discriminantValue" : 18,
            "offset" : 0
        }]
    }, {
        "name" : "Annotation",
        "meta" : "struct",
        "id" : "17422339044421236034",
        "dataWordCount" : 1,
        "pointerCount" : 1,
        "fields" : [{
            "name" : "id",
            "type" : "UInt64",
            "offset" : 0
        }, {
            "name" : "value",
            "meta" : "struct",
            "id" : "14853958794117909659",
            "offset" : 0
        }]
    }, {
        "name" : "ElementSize",
        "meta" : "enum",
        "id" : "15102134695616452902",
        "enumerants" : [{
            "name" : "empty"
        }, {
            "name" : "bit"
        }, {
            "name" : "byte"
        }, {
            "name" : "twoBytes"
        }, {
            "name" : "fourBytes"
        }, {
            "name" : "eightBytes"
        }, {
            "name" : "pointer"
        }, {
            "name" : "inlineComposite"
        }]
    }, {
        "name" : "CodeGeneratorRequest",
        "meta" : "struct",
        "id" : "13818529054586492878",
        "dataWordCount" : 0,
        "pointerCount" : 2,
        "fields" : [{
            "name" : "nodes",
            "meta" : "list",
            "type" : {
                "meta" : "struct",
                "id" : "16610026722781537303"
            },
            "offset" : 0
        }, {
            "name" : "requestedFiles",
            "meta" : "list",
            "type" : {
                "meta" : "struct",
                "id" : "14981803260258615394"
            },
            "offset" : 1
        }],
        "nodes" : [{
            "name" : "RequestedFile",
            "meta" : "struct",
            "id" : "14981803260258615394",
            "dataWordCount" : 1,
            "pointerCount" : 2,
            "fields" : [{
                "name" : "id",
                "type" : "UInt64",
                "offset" : 0
            }, {
                "name" : "filename",
                "type" : "Text",
                "offset" : 0
            }, {
                "name" : "imports",
                "meta" : "list",
                "type" : {
                    "meta" : "struct",
                    "id" : "12560611460656617445"
                },
                "offset" : 1
            }],
            "nodes" : [{
                "name" : "Import",
                "id" : "12560611460656617445",
                "dataWordCount" : 0,
                "pointerCount" : 1,
                "fields" : [{
                    "name" : "id",
                    "type" : "UInt64",
                    "offset" : 0
                }, {
                    "name" : "name",
                    "type" : "Text",
                    "offset" : 0
                }]
            }]
        }]
    }]
}
