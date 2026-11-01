"""Parses the shop's "new order" email (the data source for flow 1).

The email (from postman@site-x.pro) contains: customer name, order number,
items with price and quantity, delivery, address, payment, total, phone and
e-mail. It does NOT contain sizes (those need flow 2: order details from the shop).

Accepted shapes:
  * direct / Gmail filter auto-forward: From is the shop sender;
  * manual forward ("Fwd: ..."): the original From/Subject are read from the
    "---------- Forwarded message ---------" block. Which forwarders are
    accepted is configurable (None = any; the service should pass a list).

Manual check:  python -m app.email_parser path/to/order.eml
"""

from __future__ import annotations

import html as html_lib
import re
from dataclasses import dataclass, field
from email import policy
from email.message import EmailMessage
from email.parser import BytesParser
from email.utils import parseaddr

from .message import EmailOrder

DEFAULT_SENDERS = ("postman@site-x.pro",)

SUBJECT_RE = re.compile(r"Замовлення на сайті\s*№\s*(?P<number>[\w-]+)\s+на суму\s+(?P<sum>.+?)\s*$")
FWD_PREFIX_RE = re.compile(r"^\s*((fwd?|fw|пересл\.?)\s*:\s*)+", re.IGNORECASE)
FORWARD_MARKER_RE = re.compile(
    r"-{4,}\s*(Forwarded message|Пересланий лист|Переслане повідомлення)\s*-{4,}", re.IGNORECASE
)
FWD_FROM_RE = re.compile(r"^(From|Від)\s*:\s*(?P<v>.+)$", re.IGNORECASE | re.MULTILINE)
FWD_SUBJECT_RE = re.compile(r"^(Subject|Тема)\s*:\s*(?P<v>.+)$", re.IGNORECASE | re.MULTILINE)
GREETING_RE = re.compile(r"Вітаємо,\s*(?P<name>.+?)\s*,\s*дякуємо", re.DOTALL)
ITEM_RE = re.compile(r"^(?P<name>.+?)\s*\((?P<price>[^()]*?)\s+x\s+(?P<qty>\d+)\)\s*=\s*(?P<sum>.+)$")
FIELD_RE = re.compile(
    r"^(?P<key>Доставка|Адреса|Оплата|Доповнення|Всього|Телефон|E-mail|Побажання)\s*:\s*(?P<value>.*)$",
    re.IGNORECASE,
)


class NotAnOrderEmail(ValueError):
    """The email is not a (trusted) new-order email. .args[0] says why."""


@dataclass
class EmailItem:
    name: str
    price: str
    qty: int
    sum: str


@dataclass
class ParsedOrderEmail:
    order: EmailOrder
    items: list[EmailItem] = field(default_factory=list)
    message_id: str | None = None
    subject: str = ""
    forwarded_by: str | None = None  # set for manual forwards


# ------------------------------------------------------------------ helpers
def _norm(text: str) -> str:
    return text.replace("\xa0", " ").replace("\r\n", "\n").replace("\r", "\n")


def _squash(text: str) -> str:
    return " ".join(text.split())


def _value(v: str | None) -> str | None:
    v = _squash(v or "")
    return None if v in ("", "-", "—") else v


def _html_to_text(markup: str) -> str:
    markup = re.sub(r"(?i)<br\s*/?>|</p>|</div>|</tr>|</li>", "\n", markup)
    markup = re.sub(r"<[^>]+>", "", markup)
    return html_lib.unescape(markup)


def _body_text(msg: EmailMessage) -> str:
    part = msg.get_body(preferencelist=("plain",))
    if part is not None:
        return _norm(part.get_content())
    part = msg.get_body(preferencelist=("html",))
    if part is not None:
        return _norm(_html_to_text(part.get_content()))
    return ""


def _strip_fwd(subject: str) -> str:
    return FWD_PREFIX_RE.sub("", _norm(subject or "")).strip()


# ------------------------------------------------------------------ parsing
def parse_order_text(subject: str, body: str) -> tuple[EmailOrder, list[EmailItem]]:
    """Subject + plain-text body of the ORIGINAL shop email -> order data."""
    m = SUBJECT_RE.search(_strip_fwd(subject))
    if not m:
        raise NotAnOrderEmail(f"subject does not look like a new order: {subject!r}")
    number, subject_sum = m.group("number"), _squash(m.group("sum"))

    greeting = GREETING_RE.search(body)
    name = _squash(greeting.group("name")) if greeting else ""

    fields: dict[str, str | None] = {}
    items: list[EmailItem] = []
    for line in (ln.strip() for ln in body.split("\n")):
        if not line:
            continue
        f = FIELD_RE.match(line)
        if f:
            fields.setdefault(f.group("key").lower(), _value(f.group("value")))
            continue
        it = ITEM_RE.match(line)
        if it:
            items.append(EmailItem(
                name=_squash(it.group("name")),
                price=_squash(it.group("price")),
                qty=int(it.group("qty")),
                sum=_squash(it.group("sum")),
            ))

    order = EmailOrder(
        number=number,
        customer_name=name,
        phone=fields.get("телефон"),
        items=[f"{i.name} ({i.price} x {i.qty})" for i in items],
        total=fields.get("всього") or subject_sum,
        customer_email=fields.get("e-mail"),
        delivery=fields.get("доставка"),
        address=fields.get("адреса"),
        payment=fields.get("оплата"),
        additions=fields.get("доповнення"),
        comment=fields.get("побажання"),
    )
    return order, items


def parse_order_email(
    raw: bytes,
    senders: tuple[str, ...] | list[str] = DEFAULT_SENDERS,
    forwarders: tuple[str, ...] | list[str] | None = None,
) -> ParsedOrderEmail:
    """Raw .eml bytes -> ParsedOrderEmail, or raise NotAnOrderEmail."""
    msg = BytesParser(policy=policy.default).parsebytes(raw)
    allowed = {s.lower() for s in senders}
    top_from = parseaddr(str(msg.get("From", "")))[1].lower()
    subject = str(msg.get("Subject", ""))
    body = _body_text(msg)
    forwarded_by = None

    if top_from not in allowed:
        marker = FORWARD_MARKER_RE.search(body)
        if not marker:
            raise NotAnOrderEmail(f"sender {top_from!r} is not allowed")
        if forwarders is not None and top_from not in {f.lower() for f in forwarders}:
            raise NotAnOrderEmail(f"forwards from {top_from!r} are not allowed")
        rest = body[marker.end():]
        header = rest[:1000]
        orig_from = FWD_FROM_RE.search(header)
        orig_addr = parseaddr(orig_from.group("v"))[1].lower() if orig_from else ""
        if orig_addr not in allowed:
            raise NotAnOrderEmail(f"forwarded email is from {orig_addr!r}, not the shop")
        orig_subject = FWD_SUBJECT_RE.search(header)
        subject = orig_subject.group("v") if orig_subject else subject
        body = rest
        forwarded_by = top_from

    order, items = parse_order_text(subject, body)
    return ParsedOrderEmail(
        order=order,
        items=items,
        message_id=str(msg.get("Message-ID", "")).strip() or None,
        subject=_strip_fwd(subject),
        forwarded_by=forwarded_by,
    )


# ------------------------------------------------------------------ CLI
def _main() -> None:
    import argparse
    import json
    from dataclasses import asdict
    from pathlib import Path

    from .message import build_message

    ap = argparse.ArgumentParser(description="Parse an order .eml and preview the flow-1 message")
    ap.add_argument("eml", type=Path)
    ap.add_argument("--json", action="store_true", help="print parsed data as JSON")
    args = ap.parse_args()

    try:
        parsed = parse_order_email(args.eml.read_bytes())
    except NotAnOrderEmail as e:
        raise SystemExit(f"Not an order email: {e}")
    if args.json:
        print(json.dumps(asdict(parsed), ensure_ascii=False, indent=2))
        print()
    print(build_message(parsed.order))


if __name__ == "__main__":
    _main()
