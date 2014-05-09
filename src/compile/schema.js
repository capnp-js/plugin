module.exports = {
    "structs" : [
        {
            "name" : "Node",
            "id" : 16610026722781537303,
            "fields" : [
                {
                    "name" : "id",
                    "type" : "UInt64",
                    "isDatum" : true,
                    "offset" : 0
                }, {
                    "name" : "displayName",
                    "type" : "Text",
                    "isDatum" : false,
                    "offset" : 0
                }, {
                    "name" : "displayNamePrefixLength",
                    "type" : "UInt32",
                    "isDatum" : true,
                    "offset" : 2
                }, {
                    "name" : "scopeId",
                    "type" : "UInt64",
                    "isDatum" : true,
                    "offset" : 2
                }, {
                    "name" : "nestedNodes",
                    "type" : "List",
                    "elementType" : "NestedNode",
                    "isDatum" : false,
                    "offset" : 1
                }, {
                    "name" : "annotations",
                    "type" : "List",
                    "elementType" : "Annotations",
                    "isDatum" : false,
                    "offset" : 2
                }, {
                    "type" : "union",
                    "isDatum" : false,
                    "offset" : 6,
                    "fields" : [
                        {
                            "name" : "file",
                            "type" : "Void",
                            "isDatum" : true,
                            "tag" : 0,
                            "offset" : 0
                        }, {
                            "name" : "struct",
                            "type" : "group",
                            "isDatum" : false,
                            "tag" : 1,
                            "fields" : [
                                {
                                    "name" : "dataWordCount",
                                    "type" : "UInt16",
                                    "isDatum" : true,
                                    "offset" : 7
                                }, {
                                    "name" : "pointerCount",
                                    "type" : "UInt16",
                                    "isDatum" : true,
                                    "offset" : 12
                                }, {
                                    "name" : "preferredListEncoding",
                                    "type" : "ElementSize",
                                    "isDatum" : false,
                                    "offset" : 13
                                }, {
                                    "name" : "isGroup",
                                    "type" : "Bool",
                                    "isDatum" : true,
                                    "offset" : 224
                                }, {
                                    "name" : "discriminantCount",
                                    "type" : "UInt16",
                                    "isDatum" : true,
                                    "offset" : 15
                                }, {
                                    "name" : "discriminantOffset",
                                    "type" : "UInt32",
                                    "isDatum" : true,
                                    "offset" : 8
                                }, {
                                    "name" : "fields",
                                    "type" : "List",
                                    "elementType" : "Field",
                                    "isDatum" : false,
                                    "offset" : 3
                                }
                            ]
                        }, {
                            "name" : "enum",
                            "type" : "group",
                            "isDatum" : false,
                            "tag" : 2,
                            "fields" : [
                                {
                                    "name" : "enumerants",
                                    "type" : "List",
                                    "elementType" : "Enumerant",
                                    "isDatum" : false,
                                    "offset" : 3
                                }
                            ]
                        }, {
                            "name" : "interface",
                            "type" : "group",
                            "isDatum" : false,
                            "tag" : 3,
                            "fields" : [
                                {
                                    "name" : "methods",
                                    "type" : "List",
                                    "elementType" : "Method",
                                    "isDatum" : false,
                                    "offset" : 3
                                }, {
                                    "name" : "extends",
                                    "type" : "List",
                                    "elementType" : "UInt64",
                                    "isDatum" : false,
                                    "offset" : 4
                                }
                            ]
                        }, {
                            "name" : "const",
                            "type" : "group",
                            "isDatum" : false,
                            "tag" : 4,
                            "fields" : [
                                {
                                    "name" : "type",
                                    "type" : "Type",
                                    "isDatum" : false,
                                    "offset" : 3
                                }, {
                                    "name" : "value",
                                    "type" : "Value",
                                    "isDatum" : false,
                                    "offset" : 4
                                }
                            ]
                        }, {
                            "name" : "annotation",
                            "type" : "group",
                            "isDatum" : false,
                            "tag" : 5,
                            "fields" : [
                                {
                                    "name" : "type",
                                    "type" : "Type",
                                    "isDatum" : false,
                                    "offset" : 3
                                }, {
                                    "name" : "targetsFile",
                                    "type" : "Bool",
                                    "isDatum" : true,
                                    "offset" : 112
                                }, {
                                    "name" : "targetsConst",
                                    "type" : "Bool",
                                    "isDatum" : true,
                                    "offset" : 113
                                }, {
                                    "name" : "targetsEnum",
                                    "type" : "Bool",
                                    "isDatum" : true,
                                    "offset" : 114
                                }, {
                                    "name" : "targetsEnumerant",
                                    "type" : "Bool",
                                    "isDatum" : true,
                                    "offset" : 115
                                }, {
                                    "name" : "targetsStruct",
                                    "type" : "Bool",
                                    "isDatum" : true,
                                    "offset" : 116
                                }, {
                                    "name" : "targetsField",
                                    "type" : "Bool",
                                    "isDatum" : true,
                                    "offset" : 117
                                }, {
                                    "name" : "targetsUnion",
                                    "type" : "Bool",
                                    "isDatum" : true,
                                    "offset" : 118
                                }, {
                                    "name" : "targetsGroup",
                                    "type" : "Bool",
                                    "isDatum" : true,
                                    "offset" : 119
                                }, {
                                    "name" : "targetsInterface",
                                    "type" : "Bool",
                                    "isDatum" : true,
                                    "offset" : 120
                                }, {
                                    "name" : "targetsMethod",
                                    "type" : "Bool",
                                    "isDatum" : true,
                                    "offset" : 121
                                }, {
                                    "name" : "targetsParam",
                                    "type" : "Bool",
                                    "isDatum" : true,
                                    "offset" : 122
                                }, {
                                    "name" : "targetsAnnotation",
                                    "type" : "Bool",
                                    "isDatum" : true,
                                    "offset" : 123
                                }
                            ]
                        }
                    ]
                }
            ]
        }, {
            "name" : "NestedNode",
            "id" : 16050641862814319170,
            "owner" : 16610026722781537303,
            "fields" : [
                {
                    "name" : "name",
                    "type" : "Text",
                    "isDatum" : false,
                    "offset" : 0
                }, {
                    "name" : "id",
                    "type" : "UInt64",
                    "isDatum" : true,
                    "offset" : 0
                }
            ]
        }, {
            "name" : "Field",
            "id" : 11145653318641710175,
            "constants" : [
                {
                    "name" : "noDiscriminant",
                    "id" : 10930602151629473554,
                    "type" : "UInt16",
                    "isDatum" : true,
                    "value" : 65535
                }
            ],
            "fields" : [
                {
                    "name" : "name",
                    "type" : "Text",
                    "isDatum" : false,
                    "offset" : 0
                }, {
                    "name" : "codeOrder",
                    "type" : "UInt16",
                    "isDatum" : true,
                    "offset" : 0
                }, {
                    "name" : "annotations",
                    "type" : "List",
                    "elementType" : "Annotation",
                    "isDatum" : false,
                    "offset" : 1
                }, {
                    "name" : "discriminantValue",
                    "type" : "UInt16",
                    "isDatum" : true,
                    "defaultValue" : 65535,
                    "offset" : 1
                }, {
                    "type" : "union",
                    "isDatum" : false,
                    "offset" : 4,
                    "fields" : [
                        {
                            "name" : "slot",
                            "type" : "group",
                            "isDatum" : false,
                            "tag" : 0,
                            "fields" : [
                                {
                                    "name" : "offset",
                                    "type" : "UInt32",
                                    "isDatum" : true,
                                    "offset" : 1
                                }, {
                                    "name" : "type",
                                    "type" : "Type",
                                    "isDatum" : false,
                                    "offset" : 2
                                }, {
                                    "name" : "defaultValue",
                                    "type" : "Value",
                                    "isDatum" : false,
                                    "offset" : 3
                                }, {
                                    "name" : "hadExplicitDefault",
                                    "type" : "Bool",
                                    "isDatum" : true,
                                    "offset" : 128
                                }
                            ]
                        }, {
                            "name" : "group",
                            "type" : "group",
                            "isDatum" : false,
                            "tag" : 1,
                            "fields" : [
                                {
                                    "name" : "typeId",
                                    "type" : "UInt64",
                                    "isDatum" : true,
                                    "offset" : 2
                                }
                            ]
                        }
                    ]
                }, {
                    "name" : "ordinal",
                    "type" : "group",
                    "isDatum" : false,
                    "fields" : [
                        {
                            "type" : "union",
                            "isDatum" : false,
                            "offset" : 5,
                            "fields" : [
                                {
                                    "name" : "implicit",
                                    "type" : "Void",
                                    "isDatum" : true,
                                    "tag" : 0,
                                    "offset" : 0
                                }, {
                                    "name" : "explicit",
                                    "type" : "UInt16",
                                    "isDatum" : true,
                                    "tag" : 1,
                                    "offset" : 6
                                }
                            ]
                        }
                    ]
                }
            ]
        }, {
            "name" : "Enumerant",
            "id" : 10919677598968879693,
            "fields" : [
                {
                    "name" : "name",
                    "type" : "Text",
                    "isDatum" : false,
                    "offset" : 0
                }, {
                    "name" : "codeOrder",
                    "type" : "UInt16",
                    "isDatum" : true,
                    "offset" : 0
                }, {
                    "name" : "annotations",
                    "type" : "List",
                    "elementType" : "Annotation",
                    "isDatum" : false,
                    "offset" : 1
                }
            ]
        }, {
            "name" : "Method",
            "id" : 10736806783679155584,
            "fields" : [
                {
                    "name" : "name",
                    "type" : "Text",
                    "isDatum" : false,
                    "offset" : 0
                }, {
                    "name" : "codeOrder",
                    "type" : "UInt16",
                    "isDatum" : true,
                    "offset" : 0
                }, {
                    "name" : "paramStructType",
                    "type" : "UInt64",
                    "isDatum" : true,
                    "offset" : 1
                }, {
                    "name" : "resultStructType",
                    "type" : "UInt64",
                    "isDatum" : true,
                    "offset" : 2
                }, {
                    "name" : "annotations",
                    "type" : "List",
                    "elementType" : "Annotation",
                    "isDatum" : false,
                    "offset" : 1
                }
            ]
        }, {
            "name" : "Type",
            "id" : 15020482145304562784,
            "fields" : [
                {
                    "type" : "union",
                    "isDatum" : false,
                    "offset" : 0,
                    "fields" : [
                        {
                            "name" : "void",
                            "type" : "Void",
                            "isDatum" : true,
                            "tag" : 0,
                            "offset" : 0
                        }, {
                            "name" : "bool",
                            "type" : "Void",
                            "isDatum" : true,
                            "tag" : 1,
                            "offset" : 0
                        }, {
                            "name" : "int8",
                            "type" : "Void",
                            "isDatum" : true,
                            "tag" : 2,
                            "offset" : 0
                        }, {
                            "name" : "int16",
                            "type" : "Void",
                            "isDatum" : true,
                            "tag" : 3,
                            "offset" : 0
                        }, {
                            "name" : "int32",
                            "type" : "Void",
                            "isDatum" : true,
                            "tag" : 4,
                            "offset" : 0
                        }, {
                            "name" : "int64",
                            "type" : "Void",
                            "isDatum" : true,
                            "tag" : 5,
                            "offset" : 0
                        }, {
                            "name" : "uint8",
                            "type" : "Void",
                            "isDatum" : true,
                            "tag" : 6,
                            "offset" : 0
                        }, {
                            "name" : "uint16",
                            "type" : "Void",
                            "isDatum" : true,
                            "tag" : 7,
                            "offset" : 0
                        }, {
                            "name" : "uint32",
                            "type" : "Void",
                            "isDatum" : true,
                            "tag" : 8,
                            "offset" : 0
                        }, {
                            "name" : "uint64",
                            "type" : "Void",
                            "isDatum" : true,
                            "tag" : 9,
                            "offset" : 0
                        }, {
                            "name" : "float32",
                            "type" : "Void",
                            "isDatum" : true,
                            "tag" : 10,
                            "offset" : 0
                        }, {
                            "name" : "float64",
                            "type" : "Void",
                            "isDatum" : true,
                            "tag" : 11,
                            "offset" : 0
                        }, {
                            "name" : "text",
                            "type" : "Void",
                            "isDatum" : true,
                            "tag" : 12,
                            "offset" : 0
                        }, {
                            "name" : "data",
                            "type" : "Void",
                            "isDatum" : true,
                            "tag" : 13,
                            "offset" : 0
                        }, {
                            "name" : "list",
                            "type" : "group",
                            "isDatum" : false,
                            "tag" : 14,
                            "fields" : [
                                {
                                    "name" : "typeId",
                                    "type" : "Type",
                                    "isDatum" : false,
                                    "offset" : 0
                                }
                            ]
                        }, {
                            "name" : "enum",
                            "type" : "group",
                            "isDatum" : false,
                            "tag" : 15,
                            "fields" : [
                                {
                                    "name" : "typeId",
                                    "type" : "UInt64",
                                    "isDatum" : true,
                                    "offset" : 1
                                }
                            ]
                        }, {
                            "name" : "struct",
                            "type" : "group",
                            "isDatum" : false,
                            "tag" : 16,
                            "fields" : [
                                {
                                    "name" : "typeId",
                                    "type" : "UInt64",
                                    "isDatum" : true,
                                    "offset" : 1
                                }
                            ]
                        }, {
                            "name" : "interface",
                            "type" : "group",
                            "isDatum" : false,
                            "tag" : 17,
                            "fields" : [
                                {
                                    "name" : "typeId",
                                    "type" : "UInt64",
                                    "isDatum" : true,
                                    "offset" : 1
                                }
                            ]
                        }, {
                            "name" : "anyPointer",
                            "type" : "Void",
                            "isDatum" : true,
                            "tag" : 18,
                            "offset" : 0
                        }
                    ]
                }
            ]
        }, {
            "name" : "Value",
            "id" : 14853958794117909659,
            "fields" : [
                {
                    "type" : "union",
                    "isDatum" : false,
                    "offset" : 0,
                    "fields" : [
                        {
                            "name" : "void",
                            "type" : "Void",
                            "isDatum" : true,
                            "tag" : 0,
                            "offset" : 0
                        }, {
                            "name" : "bool",
                            "type" : "Void",
                            "isDatum" : true,
                            "tag" : 1,
                            "offset" : 0
                        }, {
                            "name" : "int8",
                            "type" : "Void",
                            "isDatum" : true,
                            "tag" : 2,
                            "offset" : 0
                        }, {
                            "name" : "int16",
                            "type" : "Void",
                            "isDatum" : true,
                            "tag" : 3,
                            "offset" : 0
                        }, {
                            "name" : "int32",
                            "type" : "Void",
                            "isDatum" : true,
                            "tag" : 4,
                            "offset" : 0
                        }, {
                            "name" : "int64",
                            "type" : "Void",
                            "isDatum" : true,
                            "tag" : 5,
                            "offset" : 0
                        }, {
                            "name" : "uint8",
                            "type" : "Void",
                            "isDatum" : true,
                            "tag" : 6,
                            "offset" : 0
                        }, {
                            "name" : "uint16",
                            "type" : "Void",
                            "isDatum" : true,
                            "tag" : 7,
                            "offset" : 0
                        }, {
                            "name" : "uint32",
                            "type" : "Void",
                            "isDatum" : true,
                            "tag" : 8,
                            "offset" : 0
                        }, {
                            "name" : "uint64",
                            "type" : "Void",
                            "isDatum" : true,
                            "tag" : 9,
                            "offset" : 0
                        }, {
                            "name" : "float32",
                            "type" : "Void",
                            "isDatum" : true,
                            "tag" : 10,
                            "offset" : 0
                        }, {
                            "name" : "float64",
                            "type" : "Void",
                            "isDatum" : true,
                            "tag" : 11,
                            "offset" : 0
                        }, {
                            "name" : "text",
                            "type" : "Void",
                            "isDatum" : true,
                            "tag" : 12,
                            "offset" : 0
                        }, {
                            "name" : "data",
                            "type" : "Void",
                            "isDatum" : true,
                            "tag" : 13,
                            "offset" : 0
                        }, {
                            "name" : "list",
                            "type" : "AnyPointer",
                            "isDatum" : false,
                            "tag" : 14,
                            "offset" : 0
                        }, {
                            "name" : "enum",
                            "type" : "UInt16",
                            "isDatum" : true,
                            "tag" : 15,
                            "offset" : 1
                        }, {
                            "name" : "struct",
                            "type" : "AnyPointer",
                            "isDatum" : false,
                            "tag" : 16,
                            "offset" : 0
                        }, {
                            "name" : "interface",
                            "type" : "Void",
                            "isDatum" : true,
                            "tag" : 17,
                            "offset" : 0
                        }, {
                            "name" : "anyPointer",
                            "type" : "AnyPointer",
                            "isDatum" : false,
                            "tag" : 18,
                            "offset" : 0
                        }
                    ]
                }
            ]
        }, {
            "name" : "Annotation",
            "id" : 17422339044421236034,
            "fields" : [
                {
                    "name" : "id",
                    "type" : "UInt64",
                    "isDatum" : true,
                    "offset" : 0
                }, {
                    "name" : "value",
                    "type" : "Value",
                    "isDatum" : false,
                    "offset" : 0
                }
            ]
        }, {
            "name" : "CodeGeneratorRequest",
            "id" : 13818529054586492878,
            "fields" : [
                {
                    "name" : "nodes",
                    "type" : "List",
                    "elementType" : "Node",
                    "isDatum" : false,
                    "offset" : 0
                }, {
                    "name" : "requestedFiles",
                    "type" : "List",
                    "elementType" : "RequestedFile",
                    "isDatum" : false,
                    "offset" : 1
                }
            ]
        }, {
            "name" : "RequestedFile",
            "id" : 14981803260258615394,
            "owner" : 13818529054586492878,
            "fields" : [
                {
                    "name" : "id",
                    "type" : "UInt64",
                    "isDatum" : true,
                    "offset" : 0
                }, {
                    "name" : "filename",
                    "type" : "Text",
                    "isDatum" : false,
                    "offset" : 0
                }, {
                    "name" : "imports",
                    "type" : "List",
                    "elementType" : "Import",
                    "isDatum" : false,
                    "offset" : 1
                }
            ]
        }, {
            "name" : "Import",
            "id" : 12560611460656617445,
            "owner" : 14981803260258615394,
            "fields" : [
                {
                    "name" : "id",
                    "type" : "UInt64",
                    "isDatum" : true,
                    "offset" : 0
                }, {
                    "name" : "name",
                    "type" : "Text",
                    "isDatum" : false,
                    "offset" : 0
                }
            ]
        }
    ]
};
