using EL.Models.Group;
using FluentValidation;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BLL.Validators
{
    public class GroupMemberValidator : AbstractValidator<GroupMember>
    {
        public GroupMemberValidator()
        {
            RuleFor(x => x.GroupId)
                .GreaterThan(0).WithMessage("GroupId must be greater than 0.");

            RuleFor(x => x.UserId)
                .NotEmpty().WithMessage("UserId is required.");
        }
    }
}
