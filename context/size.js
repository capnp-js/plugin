define(['capnp-js/reader/layout/any', 'capnp-js/reader/layout/structure', 'capnp-js/reader/list/meta', 'capnp-js/wordAlign'], function (
                                any,                          structure,                        meta,            wordAlign) {

    var targeted = function (arena, iStart, iEnd) {
        var bytes = 0;
        for (; iStart.position<iEnd.position; iStart.position += 8) {
            bytes += blob(
                arena,
                any.unsafe(arena, iStart)
            );
        }

        return bytes;
    };

    var blob = function (arena, layout) {
        var bytes;
        switch (layout.meta) {
        case 0:
            // Locals
            bytes = structure.dataBytes(pointer);
            bytes += structure.pointersBytes(pointer);

            // Follow pointers
            bytes += targeted(
                arena,
                {
                    segment : layout.segment,
                    position : layout.pointersSection
                },
                {
                    segment : layout.segment,
                    position : layout.end
                }
            );

            return bytes;
        case 1:
            // Locals
            var m = meta(layout);
            if (m.layout === 1) {
                bytes = layout.length >>> 3;
                if (layout.length & 0x07) bytes += 1;

                return wordAlign(bytes);
            } else if (m.layout === 7) {
                bytes = 8;
            } else {
                bytes = 0;
            }

            bytes += layout.length * (layout.dataBytes + layout.pointersBytes);
            bytes = wordAlign(bytes);

            if (layout.pointersBytes) {
                var iPointer = {
                    segment : layout.segment,
                    position : layout.begin + layout.dataBytes
                };

                for (var i=0; i<layout.length; ++i, iPointer.position+=layout.dataBytes) {
                    bytes += targeted(arena, iPointer, {
                        segment : iPointer.segment,
                        position : iPointer.position + layout.pointersBytes
                    });
                }
            }

            return bytes;
        }
    };

    return blob;
});
